import React from 'react'
import { GameProvider } from './context/GameContext'
import { useGame } from './context/useGame'

// Common & Modals
import Toast from './components/common/Toast'
import LoadingScreen from './components/common/LoadingScreen'
import SessionExpiredModal from './components/modals/SessionExpiredModal'
import EndSessionModal from './components/modals/EndSessionModal'
import { GummyGumLockedScreen, GummyGumCancelledScreen } from './components/common/GummyGumScreens'

// Host Screens
import HostLobby from './components/host/HostLobby'
import HostControl from './components/host/HostControl'
import HostFinish from './components/host/HostFinish'

// Player Screens
import PlayerIdentity from './components/player/PlayerIdentity'
import PlayerSaving from './components/player/PlayerSaving'
import PlayerLobby from './components/player/PlayerLobby'
import PlayerQuestion from './components/player/PlayerQuestion'
import PlayerResults from './components/player/PlayerResults'
import PlayerFinish from './components/player/PlayerFinish'

const SCREENS = {
  'host-lobby': HostLobby,
  'host-control': HostControl,
  'host-finish': HostFinish,
  'player-identity': PlayerIdentity,
  'player-saving': PlayerSaving,
  'player-lobby': PlayerLobby,
  'player-question': PlayerQuestion,
  'player-results': PlayerResults,
  'player-finish': PlayerFinish,
}

function GameRouter() {
  const { currentScreen, ggSession, ggChecked, awaitingHost, connectError, isCancelled, endedCompleted, isSessionExpired, sessionExpiredContext } = useGame()

  if (!ggChecked) {
    return <LoadingScreen key="connecting" progressive />
  }

  if (isCancelled || currentScreen === 'gg-cancelled') {
    return <GummyGumCancelledScreen isHost={Boolean(ggSession?.isHost)} completed={endedCompleted} />
  }

  if (!ggSession) {
    return <GummyGumLockedScreen />
  }

  if (connectError) {
    return <LoadingScreen key="connect-error" message="We couldn't reach the game server. Check your connection and refresh this page." />
  }

  if (awaitingHost) {
    return <LoadingScreen key="awaiting-host" message="Waiting for the host to start..." />
  }

  const Screen = SCREENS[currentScreen]

  // Would You Rather only runs from a GummyGum launch, so there is no home or setup screen to fall back to.
  if (!Screen) {
    return <LoadingScreen key="connecting" progressive />
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-start text-brand-black selection:bg-brand-orange-light selection:text-brand-orange-hover">
      {/* 
        Responsive Container:
        - On mobile (< md): Maintains the original mobile phone feel (max-w-[430px], full screen height, cozy padding)
        - On desktop (>= md): Expands into a spacious, responsive application canvas
      */}
      <div className="w-full md:max-w-4xl min-h-screen flex flex-col bg-brand-cream/40 md:my-6 md:min-h-[85vh] md:rounded-3xl md:border md:border-brand-border md:shadow-lg overflow-hidden transition-all duration-300">
        <Screen />
      </div>

      <Toast />
      {ggSession?.isHost && <EndSessionModal />}
      {isSessionExpired && (
        <SessionExpiredModal isHost={Boolean(ggSession?.isHost)} context={sessionExpiredContext} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
