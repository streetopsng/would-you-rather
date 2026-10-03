import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  FieldPath,
} from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export let isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here'
)

let app = null
let db = null
export let analytics = null
// Every Firestore call awaits this. It never rejects, so the app keeps working while rules are still open.
let authReady = Promise.resolve()

function signInAnon(firebaseApp) {
  const auth = getAuth(firebaseApp)
  return Promise.race([
    auth.authStateReady().then(() => auth.currentUser || signInAnonymously(auth)),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ]).catch((err) => console.warn('[Firebase] Anonymous sign-in failed:', err))
}

function initFirebase(config) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0]
    db = getFirestore(app)
    authReady = signInAnon(app)
    isFirebaseConfigured = true
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
        }
      })
    }
  } catch (error) {
    console.warn('[Firebase] Initialization error, falling back to local bus:', error)
  }
}

if (isFirebaseConfigured) {
  initFirebase(firebaseConfig)
}

// Fallback runtime loader for serverless environment configs without VITE_ prefix
async function ensureFirebase() {
  if (db) {
    await authReady
    return db
  }
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/firebase-config')
      if (res.ok) {
        const conf = await res.json()
        if (conf.apiKey && conf.projectId) {
          initFirebase(conf)
          await authReady
          return db
        }
      }
    } catch {
      // Fallback to local store
    }
  }
  return db
}

// Local in-memory / BroadcastChannel storage for local execution
const localStore = new Map()
const listeners = new Map()
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('gummygum_game_sync') 
  : null

if (channel) {
  channel.onmessage = (event) => {
    const { type, sessionId, data } = event.data || {}
    if (type === 'SESSION_UPDATE' && sessionId) {
      localStore.set(sessionId, data)
      const cbs = listeners.get(sessionId) || []
      cbs.forEach((cb) => cb(data))
    }
  }
}

function broadcastLocalUpdate(sessionId, data) {
  localStore.set(sessionId, data)
  const cbs = listeners.get(sessionId) || []
  cbs.forEach((cb) => cb(data))
  if (channel) {
    channel.postMessage({ type: 'SESSION_UPDATE', sessionId, data })
  }
}

const WRITE_ATTEMPTS = 5
const RETRY_DELAY_MS = 1000

// Live writes are retried and then thrown; falling back to the local store would leave every other device on the old screen.
async function withRetry(label, write) {
  let lastError = null
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt++) {
    try {
      return await write(attempt)
    } catch (e) {
      lastError = e
      console.warn(`[Firebase] ${label} failed (attempt ${attempt + 1}):`, e)
      if (e?.code === 'permission-denied' || e?.code === 'not-found') break
      if (attempt < WRITE_ATTEMPTS - 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  throw lastError
}

/**
 * Create or initialize a game session
 */
export async function createSession(sessionId, sessionData) {
  await ensureFirebase()
  const payload = {
    ...sessionData,
    id: sessionId,
    players: sessionData.players || [],
    votes: sessionData.votes || {},
    currentRound: 0,
    status: sessionData.status || 'lobby',
    updatedAt: new Date().toISOString(),
  }

  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await withRetry('createSession', async (attempt) => {
      if (attempt > 0) {
        // An earlier attempt may have landed; rewriting it would wipe players who joined since.
        const snapshot = await getDoc(sessionRef)
        if (snapshot.exists() && snapshot.data().createdAt === payload.createdAt) return
      }
      await setDoc(sessionRef, {
        ...payload,
        serverTimestamp: serverTimestamp(),
      })
    })
    return payload
  }

  broadcastLocalUpdate(sessionId, payload)
  return payload
}

/**
 * Fetch the current session document once (e.g. to recover state on
 * refresh/rejoin without blindly overwriting what's already there)
 */
export async function getSession(sessionId) {
  await ensureFirebase()
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    const snapshot = await withRetry('getSession', () => getDoc(sessionRef))
    return snapshot.exists() ? snapshot.data() : null
  }
  return localStore.get(sessionId) || null
}

/**
 * Subscribe to real-time session changes
 */
export function subscribeToSession(sessionId, callback) {
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    let unsubscribe = null
    let cancelled = false
    authReady.then(() => {
      if (cancelled) return
      unsubscribe = onSnapshot(sessionRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.data() : null)
      })
    })
    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }

  if (!listeners.has(sessionId)) {
    listeners.set(sessionId, new Set())
  }
  listeners.get(sessionId).add(callback)

  if (localStore.has(sessionId)) {
    callback(localStore.get(sessionId))
  }

  return () => {
    const list = listeners.get(sessionId)
    if (list) {
      list.delete(callback)
    }
  }
}

/**
 * Update session state (e.g. status, round, results)
 */
export async function updateSession(sessionId, updates) {
  await ensureFirebase()
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await withRetry('updateSession', () => updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
    return
  }

  const current = localStore.get(sessionId) || {}
  const next = { ...current, ...updates, updatedAt: new Date().toISOString() }
  broadcastLocalUpdate(sessionId, next)
}

/**
 * Real Player Join in session
 *
 * A player rejoining with the same email replaces their own stale entry
 * rather than duplicating it. Runs as a transaction so players joining at
 * the same moment don't overwrite each other's roster entry.
 */
export async function joinSession(sessionId, playerData) {
  await ensureFirebase()
  const merge = (existing = []) => [
    ...existing.filter((p) => p.email !== playerData.email && p.id !== playerData.id),
    { ...playerData, joinedAt: new Date().toISOString() },
  ]
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    // A burst of votes can exhaust the SDK's own retries; dropping the join would leave the player off the roster.
    let lastError = null
    for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt++) {
      try {
        return await runTransaction(db, async (tx) => {
          const snapshot = await tx.get(sessionRef)
          const updatedPlayers = merge(snapshot.exists() ? snapshot.data().players : [])
          tx.update(sessionRef, { players: updatedPlayers, updatedAt: new Date().toISOString() })
          return updatedPlayers
        })
      } catch (e) {
        lastError = e
        console.warn('[Firebase] joinSession failed:', e)
        if (e?.code !== 'failed-precondition' && e?.code !== 'aborted') break
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      }
    }
    // Writing a locally merged roster here would replace everyone else's entry.
    throw lastError
  }
  const updatedPlayers = merge((localStore.get(sessionId) || {}).players)
  await updateSession(sessionId, { players: updatedPlayers })
  return updatedPlayers
}

/**
 * Real Player Vote in session
 *
 * Writes only this player's field so concurrent votes never clobber each other.
 */
export async function recordVote(sessionId, roundIndex, playerId, choice) {
  await ensureFirebase()
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await withRetry('recordVote', () =>
      updateDoc(sessionRef, new FieldPath('votes', String(roundIndex), playerId), choice, 'updatedAt', new Date().toISOString())
    )
    return
  }
  const currentVotes = (localStore.get(sessionId) || {}).votes || {}
  const updatedVotes = { ...currentVotes, [roundIndex]: { ...(currentVotes[roundIndex] || {}), [playerId]: choice } }
  await updateSession(sessionId, { votes: updatedVotes })
}

/**
 * End session and mark status as ended so every subscribed participant is notified
 */
export async function endSession(sessionId, { completed = false } = {}) {
  await ensureFirebase()
  const updates = { status: 'ended', endedAt: Date.now(), completed, updatedAt: new Date().toISOString() }
  if (isFirebaseConfigured && db) {
    const sessionRef = doc(db, 'sessions', sessionId)
    await withRetry('endSession', () => updateDoc(sessionRef, updates))
    return
  }
  broadcastLocalUpdate(sessionId, { ...(localStore.get(sessionId) || {}), ...updates })
}
