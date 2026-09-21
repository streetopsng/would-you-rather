import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here'
)

let app = null
let db = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
  } catch (error) {
    console.warn('[Firebase] Initialization error, falling back to local bus:', error)
  }
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

/**
 * Create or initialize a game session
 */
export async function createSession(sessionId, sessionData) {
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
    try {
      const sessionRef = doc(db, 'sessions', sessionId)
      await setDoc(sessionRef, {
        ...payload,
        serverTimestamp: serverTimestamp(),
      })
      return payload
    } catch (e) {
      console.warn('[Firebase] createSession failed, using local sync:', e)
    }
  }

  broadcastLocalUpdate(sessionId, payload)
  return payload
}

/**
 * Subscribe to real-time session changes
 */
export function subscribeToSession(sessionId, callback) {
  if (isFirebaseConfigured && db) {
    try {
      const sessionRef = doc(db, 'sessions', sessionId)
      const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data())
        }
      })
      return unsubscribe
    } catch (e) {
      console.warn('[Firebase] subscribe failed, using local listener:', e)
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
  if (isFirebaseConfigured && db) {
    try {
      const sessionRef = doc(db, 'sessions', sessionId)
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      return
    } catch (e) {
      console.warn('[Firebase] updateSession failed, using local:', e)
    }
  }

  const current = localStore.get(sessionId) || {}
  const next = { ...current, ...updates, updatedAt: new Date().toISOString() }
  broadcastLocalUpdate(sessionId, next)
}

/**
 * Real Player Join in session
 */
export async function joinSession(sessionId, playerData) {
  const current = localStore.get(sessionId) || { players: [] }
  const existing = current.players || []
  const filtered = existing.filter((p) => p.email !== playerData.email && p.id !== playerData.id)
  const updatedPlayers = [...filtered, { ...playerData, joinedAt: new Date().toISOString() }]
  await updateSession(sessionId, { players: updatedPlayers })
  return updatedPlayers
}

/**
 * Real Player Vote in session
 */
export async function recordVote(sessionId, roundIndex, playerId, choice) {
  const current = localStore.get(sessionId) || { votes: {} }
  const currentVotes = current.votes || {}
  const roundVotes = currentVotes[roundIndex] || {}
  const updatedRoundVotes = { ...roundVotes, [playerId]: choice }
  const updatedVotes = { ...currentVotes, [roundIndex]: updatedRoundVotes }
  await updateSession(sessionId, { votes: updatedVotes })
  return updatedVotes
}
