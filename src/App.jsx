import React from 'react'
import { GameProvider } from './context/GameContext'
import { useGame } from './context/useGame'

// Common & Modals
import Toast from './components/common/Toast'
import CustomQuestionModal from './components/modals/CustomQuestionModal'

// Host Screens
import HostHome from './components/host/HostHome'
import HostSetup from './components/host/HostSetup'
import HostLobby from './components/host/HostLobby'
import HostControl from './components/host/HostControl'
import HostFinish from './components/host/HostFinish'

// Player Screens
import PlayerHome from './components/player/PlayerHome'
import PlayerEmail from './components/player/PlayerEmail'
import PlayerIdentity from './components/player/PlayerIdentity'
import PlayerSaving from './components/player/PlayerSaving'
import PlayerLobby from './components/player/PlayerLobby'
import PlayerQuestion from './components/player/PlayerQuestion'
import PlayerResults from './components/player/PlayerResults'
import PlayerFinish from './components/player/PlayerFinish'

function GameRouter() {
  const { currentScreen } = useGame()

  const renderScreen = () => {
    switch (currentScreen) {
      case 'homepage':
        return <HostHome />
      case 'host-setup':
        return <HostSetup />
      case 'host-lobby':
        return <HostLobby />
      case 'host-control':
        return <HostControl />
      case 'host-finish':
        return <HostFinish />
      case 'player-home':
        return <PlayerHome />
      case 'player-email':
        return <PlayerEmail />
      case 'player-identity':
        return <PlayerIdentity />
      case 'player-saving':
        return <PlayerSaving />
      case 'player-lobby':
        return <PlayerLobby />
      case 'player-question':
        return <PlayerQuestion />
      case 'player-results':
        return <PlayerResults />
      case 'player-finish':
        return <PlayerFinish />
      default:
        return <HostHome />
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-start text-brand-black selection:bg-brand-orange-light selection:text-brand-orange-hover">
      {/* 
        Responsive Container:
        - On mobile (< md): Maintains the original mobile phone feel (max-w-[430px], full screen height, cozy padding)
        - On desktop (>= md): Expands into a spacious, responsive application canvas
      */}
      <div className="w-full md:max-w-4xl min-h-screen flex flex-col bg-brand-cream/40 md:my-6 md:min-h-[85vh] md:rounded-3xl md:border md:border-brand-border md:shadow-lg overflow-hidden transition-all duration-300">
        {renderScreen()}
      </div>

      <Toast />
      <CustomQuestionModal />
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
