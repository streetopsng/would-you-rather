import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameProvider } from '../context/GameContext'
import LoadingScreen from '../components/common/LoadingScreen'
import Navbar from '../components/common/Navbar'

describe('Component Rendering', () => {
  it('renders the loading screen without a way out to a landing page', () => {
    render(<LoadingScreen progressive />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
