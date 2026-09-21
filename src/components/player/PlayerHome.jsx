import React from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerHome() {
  const { sessionName, setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-md text-center">
        <div className="text-5xl mb-4">🤔</div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
          You're invited
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black mt-2 mb-3 leading-snug">
          You've been invited to play <br />
          Would You <span className="text-brand-orange">Rather?</span>
        </h1>

        <div className="bg-brand-cream/60 rounded-2xl p-4 my-6 text-xs sm:text-sm text-brand-mid">
          <div className="font-bold text-brand-black mb-1">
            Session: <span className="text-brand-orange">{sessionName}</span>
          </div>
          <p className="leading-relaxed text-brand-muted">
            Quick two-choice questions — pick a side and see how your team compares.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentScreen('player-email')}
          className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Join the game</span>
          <span>&rsaquo;</span>
        </button>

        <p className="text-xs text-brand-muted mt-4">
          Takes about 20 seconds to set up
        </p>
      </div>
    </div>
  )
}
