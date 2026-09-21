import React from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerFinish() {
  const { setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-md">
        <div className="text-5xl mb-4">🎉</div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
          Session complete
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black mt-2 mb-3">
          That's a wrap!
        </h1>
        <p className="text-xs sm:text-sm text-brand-mid leading-relaxed max-w-xs mx-auto mb-8">
          Thanks for playing Would You Rather with your team. Hope you learned something surprising 👀
        </p>

        <button
          type="button"
          onClick={() => setCurrentScreen('homepage')}
          className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer"
        >
          Back to home
        </button>
      </div>
    </div>
  )
}
