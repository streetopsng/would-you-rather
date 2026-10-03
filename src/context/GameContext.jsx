import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  QUESTION_BANK,
  CATEGORIES,
} from '../data/questionBank'
import {
  createSession,
  getSession,
  subscribeToSession,
  updateSession,
  joinSession,
  recordVote,
  endSession,
  isFirebaseConfigured,
} from '../services/firebase'
import { sendBulkGameInvites, isBrevoConfigured } from '../services/brevo'
import { GameContext } from './GameContextBase'
import {
  resolveGummyGumLaunch,
  returnToGummyGum,
  getGummyGumSession,
  reportGummyGumResult,
  reportGummyGumCancel,
  watchHubSessionStatus,
} from '../lib/gummygumSession'
import { isAvatarId, randomAvatarId } from '../lib/avatars'


// Hours, not the lobby's 20 min: a mid-game session with no connected client
// this long is abandoned rather than just a long game.
const ABANDON_THRESHOLD_MS = 3 * 60 * 60 * 1000
const HEARTBEAT_INTERVAL_MS = 60 * 1000
const IN_GAME_STATUSES = ['in-progress', 'revealed']
const LOBBY_EXPIRY_MS = 20 * 60 * 1000

const isClosedRoom = (room, now = Date.now()) => {
  if (['ended', 'cancelled', 'expired', 'finished'].includes(room.status)) return true
  if (room.status === 'lobby') return Boolean(room.createdAt) && now - room.createdAt >= LOBBY_EXPIRY_MS
  const lastActivity = room.lastActivity || Date.parse(room.updatedAt) || room.createdAt
  return IN_GAME_STATUSES.includes(room.status) && Boolean(lastActivity) && now - lastActivity >= ABANDON_THRESHOLD_MS
}

// The hub reuses a PIN for re-runs, so the room under it may belong to an earlier hosted session.
const isFromEarlierRoom = (room, hostedSessionId) => {
  if (!room || !hostedSessionId) return false
  if (room.hostedSessionId) return room.hostedSessionId !== hostedSessionId
  return isClosedRoom(room)
}

// Per-room localStorage flags are also per hosted session, since the PIN is reused.
const roomStorageKey = (code, hostedSessionId) => [code, hostedSessionId].filter(Boolean).join('_')

function waitForHostedRoom(code, hostedSessionId) {
  return new Promise((resolve) => {
    let done = false
    let unsubscribe = null
    unsubscribe = subscribeToSession(code, (data) => {
      if (done || !data || isFromEarlierRoom(data, hostedSessionId)) return
      done = true
      if (unsubscribe) unsubscribe()
      resolve(data)
    })
    if (done && unsubscribe) unsubscribe()
  })
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function GameProvider({ children }) {
  // Screen management
  const [currentScreen, setCurrentScreen] = useState('homepage')
  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutRef = useRef(null)

  // Session Config
  const [sessionName, setSessionName] = useState('Team Bonding')
  const [roundCount, setRoundCount] = useState(15)
  const [participants, setParticipants] = useState([])
  const [customQuestions, setCustomQuestions] = useState({
    Fun: [],
    Work: [],
    Personality: [],
    Lifestyle: [],
    Silly: [],
  })

  // Questions for active session
  const [sessionQuestions, setSessionQuestions] = useState([])

  // Live session state from Firebase / store
  const [sessionId, setSessionId] = useState('')
  const [joinedPlayers, setJoinedPlayers] = useState([])
  const [sessionVotes, setSessionVotes] = useState({})
  const [invitedCount, setInvitedCount] = useState(null)
  const [ggSession, setGgSession] = useState(null)
  const [ggChecked, setGgChecked] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [awaitingHost, setAwaitingHost] = useState(false)
  const [endedCompleted, setEndedCompleted] = useState(false)
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false)
  // Firestore fires listeners on our own endSession write before it resolves; keeps the host from redirecting before the hub report.
  const hostExitInProgressRef = useRef(false)
  const sessionEndedRef = useRef(false)
  const sessionSeenRef = useRef(false)
  const buildReportRef = useRef(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [sessionCreatedAt, setSessionCreatedAt] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('lobby')
  const [sessionExpiredContext, setSessionExpiredContext] = useState('lobby')
  const sessionStatusRef = useRef('lobby')
  sessionStatusRef.current = sessionStatus

  // Host State
  const [hostQIdx, setHostQIdx] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  // Player State
  const [playerEmail, setPlayerEmail] = useState('')
  const [player, setPlayer] = useState({ id: '', name: '', av: '', email: '' })
  const [playerQIdx, setPlayerQIdx] = useState(0)
  const [playerChoice, setPlayerChoice] = useState(null)

  // Modals
  const [isCustomQModalOpen, setIsCustomQModalOpen] = useState(false)

  // Toast Notification helper
  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(msg)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }, [])

  // Build question list across categories
  const buildQuestions = useCallback((rounds, hubCategory) => {
    const withCat = (cat) => [...QUESTION_BANK[cat], ...(customQuestions[cat] || [])].map((q) => ({ ...q, cat }))
    if (hubCategory === 'office') {
      // Work alone can't fill every round count, so top up from the other categories.
      const work = shuffle(withCat('Work')).slice(0, rounds)
      const rest = shuffle(CATEGORIES.filter((c) => c !== 'Work').flatMap(withCat)).slice(0, rounds - work.length)
      return [...work, ...rest]
    }
    const perCat = Math.max(1, Math.floor(rounds / CATEGORIES.length))
    let pool = []
    CATEGORIES.forEach((cat) => {
      pool = pool.concat(shuffle(withCat(cat)).slice(0, perCat))
    })
    return shuffle(pool)
  }, [customQuestions])

  // Derive a stable, per-room player id from the GummyGum-verified email so a
  // closed-tab/refresh rejoin reclaims the SAME player (and their votes)
  // instead of colliding with a fresh randomly-generated id every time.
  const stablePlayerId = (email) => {
    const clean = (email || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
    return clean ? `p_${clean}` : 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  }

  const screenForSessionStatus = (status) => {
    switch (status) {
      case 'in-progress':
      case 'revealed':
        return 'host-control'
      case 'finished':
        return 'host-finish'
      default:
        return 'host-lobby'
    }
  }

  // 0. Auto-resolve GummyGum launch (?ggt= or URL params)
  const routedRef = useRef(false)
  useEffect(() => {
    if (routedRef.current) return
    resolveGummyGumLaunch().then(async (launchSession) => {
      setGgSession(launchSession)
      setGgChecked(true)
      if (routedRef.current) return
      const params = new URLSearchParams(window.location.search)
      const code = launchSession?.roomCode || params.get('pin') || params.get('sessionId') || params.get('code') || params.get('room')
      const isHost = launchSession?.isHost ?? (
        params.get('host') === 'true' ||
        params.get('isHost') === 'true' ||
        params.get('role') === 'host'
      )
      const queryInvited = params.get('invitedCount')
      const invCount = launchSession?.invitedCount || (queryInvited ? parseInt(queryInvited, 10) : null)
      if (invCount) setInvitedCount(invCount)

      const queryEmail = (params.get('email') || launchSession?.player?.email || '').toLowerCase().trim()
      const queryName = params.get('name') || launchSession?.player?.name || ''

      if (code) {
        routedRef.current = true
        setIsSessionExpired(false)

        let existing = await getSession(code).catch(() => null)
        const hostedSessionId = launchSession?.hostedSessionId || null
        let fromEarlierRoom = isFromEarlierRoom(existing, hostedSessionId)
        if (!isHost && hostedSessionId && (!existing || fromEarlierRoom)) {
          setAwaitingHost(true)
          existing = await waitForHostedRoom(code, hostedSessionId)
          fromEarlierRoom = false
          setAwaitingHost(false)
        }
        setSessionId(code)

        // Checked before this client's heartbeat starts so a returning
        // client can't mask a genuinely abandoned session.
        if (existing && !fromEarlierRoom && IN_GAME_STATUSES.includes(existing.status)) {
          const lastActivity = existing.lastActivity || Date.parse(existing.updatedAt) || existing.createdAt
          if (lastActivity && Date.now() - lastActivity >= ABANDON_THRESHOLD_MS) {
            await updateSession(code, { status: 'expired', abandoned: true }).catch(() => {})
            existing.status = 'expired'
            existing.abandoned = true
            setSessionExpiredContext('game')
            setIsSessionExpired(true)
          }
        }

        // Host only: every player writing the session doc kept colliding with joinSession's transaction.
        setInterval(() => {
          if (isHost && !sessionEndedRef.current && IN_GAME_STATUSES.includes(sessionStatusRef.current)) {
            updateSession(code, { lastActivity: Date.now() }).catch(() => {})
          }
        }, HEARTBEAT_INTERVAL_MS)

        if (isHost) {
          // Recover an existing session (e.g. the host hard-refreshed mid-game)
          // instead of blindly recreating it, which would wipe every joined
          // player, vote and round in progress back to an empty lobby.
          // A room this same hosted session ended is recovered too, so the listener sends a duplicate tab back to the hub.
          const sameHostedSession = Boolean(hostedSessionId) && existing?.hostedSessionId === hostedSessionId
          if (existing && existing.status && !fromEarlierRoom && (sameHostedSession || (existing.status !== 'cancelled' && existing.status !== 'ended'))) {
            if (hostedSessionId && !existing.hostedSessionId) {
              updateSession(code, { hostedSessionId }).catch(() => {})
            }
            setSessionName(existing.name || `${launchSession?.player?.name || queryName || 'Host'}'s Would You Rather`)
            setSessionQuestions(existing.questions || [])
            setJoinedPlayers(existing.players || [])
            setSessionVotes(existing.votes || {})
            setSessionStatus(existing.status)
            setSessionCreatedAt(existing.createdAt || null)
            setHostQIdx(typeof existing.currentRound === 'number' ? existing.currentRound : 0)
            setIsRevealed(existing.status === 'revealed')
            if (existing.invitedCount) setInvitedCount(existing.invitedCount)
            setCurrentScreen(screenForSessionStatus(existing.status))
          } else {
            const hubConfig = launchSession?.config || {}
            const hostName = launchSession?.player?.name || queryName || 'Host'
            const name = hubConfig.name || `${hostName}'s Would You Rather`
            const rounds = Number(hubConfig.roundCount) > 0 ? Number(hubConfig.roundCount) : 15
            setSessionName(name)
            const qList = buildQuestions(rounds, hubConfig.category)
            setSessionQuestions(qList)
            await createSession(code, {
              name,
              rounds,
              questions: qList,
              invitedCount: invCount,
              hostedSessionId,
              status: 'lobby',
              createdAt: Date.now(),
            }).catch(() => {})
            setCurrentScreen('host-lobby')
          }
        } else if (existing && (existing.status === 'ended' || existing.status === 'cancelled')) {
          sessionEndedRef.current = true
          setEndedCompleted(Boolean(existing.completed))
          setIsCancelled(true)
        } else {
          // Participant Flow
          const storedAv = queryEmail ? localStorage.getItem(`wyr_avatar_${queryEmail}`) : null
          const savedAv = isAvatarId(storedAv) ? storedAv : null
          const savedN = queryName || (queryEmail ? localStorage.getItem(`wyr_name_${queryEmail}`) : null)
          const roomKey = roomStorageKey(code, hostedSessionId)
          const alreadyJoined = queryEmail ? localStorage.getItem(`wyr_joined_${roomKey}_${queryEmail}`) === 'true' : false
          // The invite email is the identity, so a rejoin from another device/browser finds its record in the room.
          const pId = queryEmail ? stablePlayerId(queryEmail) : ''
          const existingMe = pId && existing && !fromEarlierRoom
            ? (existing.players || []).find((p) => p.id === pId || (p.email || '').toLowerCase().trim() === queryEmail)
            : null

          if ((alreadyJoined && savedAv) || existingMe) {
            const restoredAv = isAvatarId(existingMe?.av) ? existingMe.av : savedAv
            const restoredPlayer = { id: pId, name: queryName || existingMe?.name || savedN || 'Teammate', av: restoredAv, email: queryEmail }
            setPlayer(restoredPlayer)
            setPlayerEmail(queryEmail)
            if (restoredAv) localStorage.setItem(`wyr_avatar_${queryEmail}`, restoredAv)
            localStorage.setItem(`wyr_joined_${roomKey}_${queryEmail}`, 'true')
            const savedProgress = queryEmail
              ? parseInt(localStorage.getItem(`wyr_progress_${roomKey}_${queryEmail}`) || '0', 10)
              : 0
            const votedRounds = Object.keys(existing?.votes || {})
              .filter((r) => existing.votes[r] && existing.votes[r][pId] !== undefined)
              .map(Number)
            const votedProgress = votedRounds.length ? Math.max(...votedRounds) + 1 : 0
            setPlayerQIdx(Math.max(Number.isFinite(savedProgress) ? savedProgress : 0, votedProgress))
            await joinSession(code, restoredPlayer).catch(() => {})
            setCurrentScreen('player-lobby')
          } else {
            if (queryEmail) setPlayerEmail(queryEmail)
            setPlayer({ id: '', name: queryName, email: queryEmail, av: savedAv || '' })
            setCurrentScreen('player-identity')
          }
        }
      }
    })
  }, [buildQuestions])

  // Real participant management
  const addParticipant = (name, email, dept = 'Team') => {
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required')
      return false
    }
    const newParticipant = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      dept: dept.trim() || 'Team',
      av: randomAvatarId(),
      selected: true,
      joined: false,
    }
    setParticipants((prev) => [...prev, newParticipant])
    showToast(`Added ${newParticipant.name} to the team`)
    return true
  }

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleParticipant = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    )
  }

  const selectAllParticipants = () => {
    const allSelected = participants.length > 0 && participants.every((p) => p.selected)
    setParticipants((prev) => prev.map((p) => ({ ...p, selected: !allSelected })))
  }

  // Add custom question
  const addCustomQuestion = (cat, a, b) => {
    if (!a.trim() || !b.trim()) {
      showToast('Please fill in both options')
      return false
    }
    setCustomQuestions((prev) => ({
      ...prev,
      [cat]: [...(prev[cat] || []), { a: a.trim(), b: b.trim() }],
    }))
    showToast(`Added to ${cat} — it can appear in this session!`)
    setIsCustomQModalOpen(false)
    return true
  }

  // Subscribe to real-time session changes when sessionId is active
  useEffect(() => {
    if (!sessionId) return
    const unsubscribe = subscribeToSession(sessionId, (data) => {
      // No snapshot before we've seen the doc is the create-race; after that it means the room was deleted.
      if (!data) {
        if (sessionSeenRef.current && !ggSession?.isHost && ggSession) {
          sessionEndedRef.current = true
          setIsCancelled(true)
        }
        return
      }
      sessionSeenRef.current = true

      const ownHostedSessionId = ggSession?.hostedSessionId
      if (!ggSession?.isHost && ownHostedSessionId && data.hostedSessionId && data.hostedSessionId !== ownHostedSessionId) {
        // The host re-created this PIN for a newer hosted session, so this participant's session is over.
        sessionEndedRef.current = true
        setIsCancelled(true)
        return
      }

      if (data.status === 'cancelled' || data.status === 'ended') {
        sessionEndedRef.current = true
        if (ggSession?.isHost) {
          if (!hostExitInProgressRef.current) returnToGummyGum()
        } else if (ggSession) {
          setEndedCompleted(Boolean(data.completed))
          setIsCancelled(true)
        }
        return
      }

      if (data.status) setSessionStatus(data.status)
      if (data.createdAt) setSessionCreatedAt(data.createdAt)

      if (data.status === 'expired') {
        setSessionExpiredContext(data.abandoned ? 'game' : 'lobby')
        setIsSessionExpired(true)
        return
      }

      // Idle lobby sessions expire after 20 minutes of inactivity
      if (data.status === 'lobby' && data.createdAt && Date.now() - data.createdAt >= 20 * 60 * 1000) {
        setIsSessionExpired(true)
        return
      }

      if (data.invitedCount && !invitedCount) setInvitedCount(data.invitedCount)
      if (data.players) setJoinedPlayers(data.players)
      if (data.votes) setSessionVotes(data.votes)
      if (data.questions) setSessionQuestions(data.questions)
      if (typeof data.currentRound === 'number') {
        setHostQIdx(data.currentRound)
      }
      if (data.status === 'in-progress' && currentScreen === 'player-lobby') {
        setCurrentScreen('player-question')
      }
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [sessionId, currentScreen, ggSession, invitedCount])

  // The host may end the session from the hub, which never touches this room.
  const hubPin = ggSession?.roomCode || sessionId
  useEffect(() => {
    if (!ggSession || !hubPin || !ggSession.hostedSessionId) return
    return watchHubSessionStatus({
      pin: hubPin,
      hostedSessionId: ggSession.hostedSessionId,
      onEnded: (hubSession) => {
        if (sessionEndedRef.current || hostExitInProgressRef.current) return
        sessionEndedRef.current = true
        const completed = sessionStatusRef.current === 'finished'
        if (ggSession.isHost) {
          hostExitInProgressRef.current = true
          const hubUrl = ggSession.hubUrl
          // A newer re-run owns the PIN's room now, so only mark it ended if it is still ours.
          const ownRoom = String(hubSession.id) === String(ggSession.hostedSessionId)
          const markEnded = ownRoom ? endSession(hubPin, { completed }).catch(() => {}) : Promise.resolve()
          // A finished game ended from the hub still owes the hub its results.
          const report = ownRoom && completed ? reportGummyGumResult(buildReportRef.current()) : Promise.resolve()
          Promise.allSettled([markEnded, report]).finally(() => returnToGummyGum(hubUrl))
        } else {
          setAwaitingHost(false)
          setEndedCompleted(completed)
          setIsCancelled(true)
        }
      },
    })
  }, [ggSession, hubPin])

  // Real-time interval check every 10s for 20-minute lobby expiration (idle in lobby only!)
  useEffect(() => {
    if (sessionStatus !== 'lobby' || !sessionCreatedAt) return

    const checkExpiration = () => {
      const elapsed = Date.now() - sessionCreatedAt
      if (elapsed >= 20 * 60 * 1000) {
        setIsSessionExpired(true)
      }
    }

    checkExpiration()
    const interval = setInterval(checkExpiration, 10000)
    return () => clearInterval(interval)
  }, [sessionStatus, sessionCreatedAt])

  // Launch Session from Host Setup
  const launchHostSession = async () => {
    const selected = participants.filter((p) => p.selected)
    if (!selected.length) {
      showToast('Select at least one teammate to invite')
      return
    }

    const qList = buildQuestions(roundCount)
    setSessionQuestions(qList)

    const cleanId = (sessionName.trim() || 'team-session')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
    setSessionId(cleanId)

    // Create real session in Firestore / Database
    await createSession(cleanId, {
      name: sessionName.trim(),
      rounds: roundCount,
      questions: qList,
      invitedParticipants: selected,
      players: [],
      votes: {},
      status: 'lobby',
      createdAt: Date.now(),
    })

    // Dispatch real email invites through Brevo
    const inviteUrl = window.location.origin
    sendBulkGameInvites({
      participants: selected,
      sessionName: sessionName.trim(),
      gameUrl: inviteUrl,
    }).then((res) => {
      if (res.isSimulated) {
        showToast(`Invites prepared for ${selected.length} teammates`)
      } else {
        showToast(`Invites dispatched via Brevo to ${res.succeeded}/${selected.length} teammates`)
      }
    })

    setCurrentScreen('host-lobby')
  }

  // Host starts the game
  const startHostGame = async () => {
    if (joinedPlayers.length < 2) {
      showToast('Wait for at least 2 participants to join')
      return
    }

    setHostQIdx(0)
    setIsRevealed(false)
    if (sessionId) {
      await updateSession(sessionId, { status: 'in-progress', currentRound: 0 })
    }
    setCurrentScreen('host-control')
  }

  const revealHostResults = async () => {
    setIsRevealed(true)
    if (sessionId) {
      await updateSession(sessionId, { status: 'revealed' })
    }
  }

  const nextHostQuestion = async () => {
    const nextIdx = hostQIdx + 1
    if (nextIdx >= sessionQuestions.length) {
      if (sessionId) {
        await updateSession(sessionId, { status: 'finished' })
      }
      setSessionStatus('finished')
      setCurrentScreen('host-finish')
    } else {
      setHostQIdx(nextIdx)
      setIsRevealed(false)
      if (sessionId) {
        await updateSession(sessionId, { currentRound: nextIdx, status: 'in-progress' })
      }
    }
  }

  const buildReport = () => {
    const leaderboard = joinedPlayers.map((p) => ({
      name: p.name || 'Player',
      score: Object.values(sessionVotes || {}).filter((round) => round && p.id in round).length,
      streak: 0,
      isHost: false,
    }))
    return {
      experience: 'would-you-rather',
      sessionName,
      rounds: sessionQuestions.length,
      leaderboard,
    }
  }

  useEffect(() => {
    buildReportRef.current = buildReport
  })

  const hostEndSession = async () => {
    if (hostExitInProgressRef.current) return
    hostExitInProgressRef.current = true
    setIsEndingSession(true)
    const hubUrl = getGummyGumSession()?.hubUrl
    const completed = sessionStatus === 'finished'
    if (sessionId) {
      await endSession(sessionId, { completed }).catch(() => {})
    }
    const reported = completed ? await reportGummyGumResult(buildReport()) : false
    if (!reported) await reportGummyGumCancel()
    returnToGummyGum(hubUrl)
  }

  // Player Flow
  const initPlayerFlow = () => {
    if (!sessionQuestions.length) {
      setSessionQuestions(buildQuestions(roundCount))
    }
    setPlayerEmail('')
    setPlayer({ id: '', name: '', av: '', email: '' })
    setCurrentScreen('player-home')
  }

  const submitPlayerEmailInput = (email) => {
    setPlayerEmail(email)
    setCurrentScreen('player-identity')
  }

  const savePlayerIdentity = async (name, av) => {
    if (sessionEndedRef.current) return
    const pId = stablePlayerId(playerEmail)
    const newPlayer = { id: pId, name: name.trim(), av, email: playerEmail }
    setPlayer(newPlayer)
    setCurrentScreen('player-saving')

    const cleanId = sessionId || (sessionName.trim() || 'team-session')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
    setSessionId(cleanId)

    if (playerEmail) {
      const normEmail = playerEmail.toLowerCase().trim()
      localStorage.setItem(`wyr_avatar_${normEmail}`, av)
      localStorage.setItem(`wyr_name_${normEmail}`, name.trim())
      localStorage.setItem(`wyr_joined_${roomStorageKey(cleanId, ggSession?.hostedSessionId)}_${normEmail}`, 'true')
    }

    try {
      await joinSession(cleanId, newPlayer)
    } catch (e) {
      console.warn('[WYR] join failed, entering lobby anyway:', e)
    }

    setTimeout(() => {
      setCurrentScreen('player-lobby')
    }, 600)
  }

  const startPlayerGame = () => {
    if (!sessionQuestions.length) {
      setSessionQuestions(buildQuestions(roundCount))
    }
    // Don't stomp playerQIdx here — a rejoining player already had their
    // in-progress round restored from localStorage; only a genuinely fresh
    // player starts at 0 (its default state).
    setPlayerChoice(null)
    setCurrentScreen('player-question')
  }

  const answerPlayerQuestion = async (choice) => {
    if (playerChoice || sessionEndedRef.current) return
    setPlayerChoice(choice)

    // Record real vote in Firestore
    const cleanId = sessionId || (sessionName.trim() || 'team-session').toLowerCase().replace(/[^a-z0-9]/g, '-')
    const pId = player.id || player.name || 'anonymous_player'
    await recordVote(cleanId, playerQIdx, pId, choice)

    setTimeout(() => {
      setCurrentScreen('player-results')
    }, 600)
  }

  const nextPlayerQuestion = () => {
    const nextIdx = playerQIdx + 1
    if (playerEmail && sessionId) {
      localStorage.setItem(`wyr_progress_${roomStorageKey(sessionId, ggSession?.hostedSessionId)}_${playerEmail.toLowerCase().trim()}`, String(nextIdx))
    }
    if (nextIdx >= sessionQuestions.length) {
      setCurrentScreen('player-finish')
    } else {
      setPlayerQIdx(nextIdx)
      setPlayerChoice(null)
      setCurrentScreen('player-question')
    }
  }

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        toastMessage,
        showToast,
        sessionName,
        setSessionName,
        roundCount,
        setRoundCount,
        participants,
        addParticipant,
        removeParticipant,
        toggleParticipant,
        selectAllParticipants,
        customQuestions,
        addCustomQuestion,
        sessionQuestions,
        sessionId,
        joinedPlayers,
        sessionVotes,
        // Host
        hostQIdx,
        isRevealed,
        launchHostSession,
        startHostGame,
        revealHostResults,
        nextHostQuestion,
        // Player
        playerEmail,
        player,
        playerQIdx,
        playerChoice,
        initPlayerFlow,
        submitPlayerEmailInput,
        savePlayerIdentity,
        startPlayerGame,
        answerPlayerQuestion,
        nextPlayerQuestion,
        // Modals
        isEndSessionModalOpen,
        setIsEndSessionModalOpen,
        isEndingSession,
        hostEndSession,
        isCustomQModalOpen,
        setIsCustomQModalOpen,
        // Config statuses
        isFirebaseConfigured,
        isBrevoConfigured,
        // GummyGum Integration
        ggSession,
        ggChecked,
        awaitingHost,
        isCancelled,
        endedCompleted,
        isSessionExpired,
        sessionExpiredContext,
        invitedCount,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

