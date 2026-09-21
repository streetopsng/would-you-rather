import React from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerSaving() {
  const { player } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-brand-orange text-5xl flex items-center justify-center shadow-lg border-2 border-brand-orange-hover animate-save-pulse mb-6">
        {player.av || '🙂'}
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-brand-black mb-4">
        Saving your identity...
      </h2>

      <div className="text-3xl animate-spin">
        🪐
      </div>
    </div>
  )
}
