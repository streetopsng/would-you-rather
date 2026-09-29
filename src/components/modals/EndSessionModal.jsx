import React from 'react'
import { useGame } from '../../context/useGame'
import { IconLogOut } from '../common/Icons'

export default function EndSessionModal() {
  const { isEndSessionModalOpen, setIsEndSessionModalOpen, isEndingSession, hostEndSession, currentScreen } = useGame()

  if (!isEndSessionModalOpen) return null

  const isFinished = currentScreen === 'host-finish'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEndingSession) setIsEndSessionModalOpen(false)
      }}
    >
      <div className="bg-white border-2 border-brand-border rounded-[24px] p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-fadeUp flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-3 shadow-xs">
          <IconLogOut className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-brand-black mb-1.5">End this session?</h3>
        <p className="text-xs sm:text-[13px] text-brand-mid leading-relaxed mb-6">
          {isFinished
            ? 'Results will be saved, everyone will be removed and the session will close in GummyGum.'
            : 'Everyone will be removed and the session will close in GummyGum.'}
        </p>

        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={hostEndSession}
            disabled={isEndingSession}
            className="w-full py-3 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white active:translate-y-0.5 transition-all cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isEndingSession ? 'Ending session...' : 'End session'}
          </button>
          <button
            type="button"
            onClick={() => setIsEndSessionModalOpen(false)}
            disabled={isEndingSession}
            className="w-full py-3 rounded-xl font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-brand-border transition-all cursor-pointer text-sm disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
