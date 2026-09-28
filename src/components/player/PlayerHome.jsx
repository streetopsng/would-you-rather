import React from 'react'
import { useGame } from '../../context/useGame'
import { IconHelpCircle, IconChevronRight } from '../common/Icons'

export default function PlayerHome() {
  const { sessionName, setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange-light border border-brand-orange/60 flex items-center justify-center text-brand-orange-hover mx-auto mb-4">
          <IconHelpCircle className="w-8 h-8" />
        </div>
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
          className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base border border-brand-orange-hover shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Join the game</span>
          <IconChevronRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-brand-muted mt-4">
          Takes about 20 seconds to set up
        </p>
      </div>
    </div>
  )
}
