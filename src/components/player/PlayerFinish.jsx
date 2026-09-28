import React from 'react'
import { useGame } from '../../context/useGame'
import { returnToGummyGum } from '../../lib/gummygumSession'
import { IconCheckCircle } from '../common/Icons'

export default function PlayerFinish() {
  const { setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange-light border border-brand-orange/60 flex items-center justify-center text-brand-orange-hover mx-auto mb-4">
          <IconCheckCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
          Session complete
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black mt-2 mb-3">
          That's a wrap!
        </h1>
        <p className="text-xs sm:text-sm text-brand-mid leading-relaxed max-w-xs mx-auto mb-8">
          Thanks for playing Would You Rather with your team. Hope you learned something surprising.
          <br /><br />
          <span className="font-semibold text-brand-black">You can safely close this tab now.</span>
        </p>

        <button
          type="button"
          onClick={() => {
            try { window.close() } catch {}
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-brand-cream hover:bg-stone-200 border border-brand-border text-brand-black font-bold text-sm transition-all cursor-pointer"
        >
          Close Tab
        </button>
      </div>
    </div>
  )
}
