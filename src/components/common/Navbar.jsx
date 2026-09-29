import React from 'react'
import { useGame } from '../../context/useGame'
import { IconLogOut } from './Icons'

export default function Navbar({ contextText }) {
  const { sessionName, ggSession, setIsEndSessionModalOpen } = useGame()
  const isHost = Boolean(ggSession?.isHost)

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-brand-border/60">
      <div className="flex items-center gap-3">
        <span className="text-sm sm:text-base font-black text-brand-orange tracking-tight">
          GummyGum
        </span>
        <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-lg bg-brand-orange-light text-brand-orange-hover">
          Would You Rather
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs text-right hidden sm:inline">
          {contextText || sessionName}
        </span>
        {isHost && (
          <button
            type="button"
            onClick={() => setIsEndSessionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
          >
            <IconLogOut className="w-3.5 h-3.5" />
            <span>End session</span>
          </button>
        )}
      </div>
    </header>
  )
}
