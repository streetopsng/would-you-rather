import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  QUESTION_BANK,
  CATEGORIES,
} from '../data/questionBank'
import {
  createSession,
  subscribeToSession,
  updateSession,
  joinSession,
  recordVote,
  isFirebaseConfigured,
} from '../services/firebase'
import { sendBulkGameInvites, isBrevoConfigured } from '../services/brevo'
import { GameContext } from './GameContextBase'
import { resolveGummyGumLaunch, returnToGummyGum, closeGummyGumSession } from '../lib/gummygumSession'


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

  // Host State
  const [hostQIdx, setHostQIdx] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  // Player State
  const [playerEmail, setPlayerEmail] = useState('')
  const [player, setPlayer] = useState({ id: '', name: '', av: '🙂', email: '' })
  const [playerQIdx, setPlayerQIdx] = useState(0)
  const [playerChoice, setPlayerChoice] = useState(null)

  // Modals
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isCustomQModalOpen, setIsCustomQModalOpen] = useState(false)

  // Toast Notification helper
  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(msg)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }, [])

  // 0. Auto-resolve GummyGum launch (?ggt= or URL params)
  const routedRef = useRef(false)
  useEffect(() => {
    if (routedRef.current) return
    resolveGummyGumLaunch().then(async (launchSession) => {
      if (routedRef.current) return
      const params = new URLSearchParams(window.location.search)
      const code = launchSession?.roomCode || params.get('pin') || params.get('sessionId') || params.get('code') || params.get('room')
      const isHost = launchSession?.isHost ?? (
        params.get('host') === 'true' ||
        params.get('isHost') === 'true' ||
        params.get('role') === 'host'
      )
      const queryEmail = (params.get('email') || launchSession?.player?.email || '').toLowerCase().trim()
      const queryName = params.get('name') || launchSession?.player?.name || ''

      if (code) {
        routedRef.current = true
        setSessionId(code)

        if (isHost) {
          const hostName = launchSession?.player?.name || queryName || 'Host'
          setSessionName(`${hostName}'s Would You Rather`)
          const qList = buildQuestions(15)
          setSessionQuestions(qList)
          await createSession(code, {
            name: `${hostName}'s Would You Rather`,
            rounds: 15,
            questions: qList,
            status: 'lobby',
          }).catch(() => {})
          setCurrentScreen('host-lobby')
        } else {
          // Participant Flow
          const savedAv = queryEmail ? localStorage.getItem(`wyr_avatar_${queryEmail}`) : null
          const savedN = (queryEmail ? localStorage.getItem(`wyr_name_${queryEmail}`) : null) || queryName
          const alreadyJoined = queryEmail ? localStorage.getItem(`wyr_joined_${code}_${queryEmail}`) === 'true' : false

          if (alreadyJoined && savedAv) {
            const pId = 'p_' + Date.now()
            const restoredPlayer = { id: pId, name: savedN || 'Teammate', av: savedAv, email: queryEmail }
            setPlayer(restoredPlayer)
            setPlayerEmail(queryEmail)
            await joinSession(code, restoredPlayer).catch(() => {})
            setCurrentScreen('player-lobby')
          } else {
            if (queryEmail) setPlayerEmail(queryEmail)
            if (queryName) setPlayer((p) => ({ ...p, name: queryName, email: queryEmail, ...(savedAv && { av: savedAv }) }))
            setCurrentScreen('player-identity')
          }
        }
      }
    })
  }, [buildQuestions])

  // Build question list across categories
  const buildQuestions = useCallback((rounds) => {
    const perCat = Math.max(1, Math.floor(rounds / CATEGORIES.length))
    let pool = []
    CATEGORIES.forEach((cat) => {
      const combined = [...QUESTION_BANK[cat], ...(customQuestions[cat] || [])]
      const sliced = shuffle(combined).slice(0, perCat).map((q) => ({ ...q, cat }))
      pool = pool.concat(sliced)
    })
    return shuffle(pool)
  }, [customQuestions])

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
      av: '🙂',
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
      if (!data) return
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
  }, [sessionId, currentScreen])

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
    if (joinedPlayers.length === 0) {
      showToast('Wait for at least one teammate to join')
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
      setCurrentScreen('host-finish')
    } else {
      setHostQIdx(nextIdx)
      setIsRevealed(false)
      if (sessionId) {
        await updateSession(sessionId, { currentRound: nextIdx, status: 'in-progress' })
      }
    }
  }

  // Player Flow
  const initPlayerFlow = () => {
    if (!sessionQuestions.length) {
      setSessionQuestions(buildQuestions(roundCount))
    }
    setPlayerEmail('')
    setPlayer({ id: '', name: '', av: '🙂', email: '' })
    setCurrentScreen('player-home')
  }

  const submitPlayerEmailInput = (email) => {
    setPlayerEmail(email)
    setCurrentScreen('player-identity')
  }

  const savePlayerIdentity = async (name, av) => {
    const pId = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
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
      localStorage.setItem(`wyr_joined_${cleanId}_${normEmail}`, 'true')
    }

    // Register player in Firestore
    await joinSession(cleanId, newPlayer)

    setTimeout(() => {
      setCurrentScreen('player-lobby')
    }, 1200)
  }

  const startPlayerGame = () => {
    if (!sessionQuestions.length) {
      setSessionQuestions(buildQuestions(roundCount))
    }
    setPlayerQIdx(0)
    setPlayerChoice(null)
    setCurrentScreen('player-question')
  }

  const answerPlayerQuestion = async (choice) => {
    if (playerChoice) return
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
        isAvatarModalOpen,
        setIsAvatarModalOpen,
        isCustomQModalOpen,
        setIsCustomQModalOpen,
        // Config statuses
        isFirebaseConfigured,
        isBrevoConfigured,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

