import React from 'react'
import { useGame } from '../../context/useGame'
import Avatar from '../common/Avatar'
import { IconLoader } from '../common/Icons'

export default function PlayerSaving() {
  const { player } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-brand-orange flex items-center justify-center shadow-lg border-2 border-brand-orange-hover animate-save-pulse mb-6 p-1">
        <Avatar id={player.av} className="w-full h-full" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-brand-black mb-4">
        Joining the lobby...
      </h2>

      <IconLoader className="w-7 h-7 text-brand-orange animate-spin" />
    </div>
  )
}
