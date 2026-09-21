import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameProvider } from '../context/GameContext'
import HostHome from '../components/host/HostHome'
import PlayerHome from '../components/player/PlayerHome'
import Navbar from '../components/common/Navbar'

describe('Component Rendering', () => {
  it('renders HostHome with title and CTA', () => {
    render(
      <GameProvider>
        <HostHome />
      </GameProvider>
    )

    expect(screen.getByText(/Would You/i)).toBeInTheDocument()
    expect(screen.getByText(/Create a game/i)).toBeInTheDocument()
  })

  it('renders PlayerHome with invitation banner', () => {
    render(
      <GameProvider>
        <PlayerHome />
      </GameProvider>
    )

    expect(screen.getByText(/You're invited/i)).toBeInTheDocument()
    expect(screen.getByText(/Join the game/i)).toBeInTheDocument()
  })

  it('renders Navbar with GummyGum branding', () => {
    render(
      <GameProvider>
        <Navbar contextText="Team Bonding" />
      </GameProvider>
    )

    expect(screen.getByText('GummyGum')).toBeInTheDocument()
    expect(screen.getByText('Team Bonding')).toBeInTheDocument()
  })
})
