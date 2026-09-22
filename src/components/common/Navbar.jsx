import React from 'react'
import { useGame } from '../../context/useGame'
import { returnToGummyGum } from '../../lib/gummygumSession'

export default function Navbar({ contextText }) {
  const { sessionName } = useGame()

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-brand-border/60">
      <div className="flex items-center gap-3">
        <span className="text-sm sm:text-base font-black text-brand-orange tracking-tight">
          GummyGum
        </span>
        <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-brand-orange-light text-brand-orange-hover">
          Would You Rather
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs text-right hidden sm:inline">
          {contextText || sessionName}
        </span>
        <button
          type="button"
          onClick={() => returnToGummyGum()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-brand-border text-xs font-bold text-brand-black hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          title="Back to GummyGum"
        >
          <span>← Back to GummyGum</span>
        </button>
      </div>
    </header>
  )
}
