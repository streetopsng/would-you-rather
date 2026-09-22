import React from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import { closeGummyGumSession } from '../../lib/gummygumSession'

export default function HostFinish() {
  const { sessionName, sessionQuestions, setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <Navbar title="Session Complete" contextText={sessionName} />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center text-center">
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-md w-full">
          <div className="text-5xl mb-4">🏁</div>
          <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
            Session complete
          </span>
          <h2 className="text-3xl font-black text-brand-black mt-2 mb-3">
            Nice round, team!
          </h2>
          <p className="text-sm text-brand-mid leading-relaxed max-w-xs mx-auto">
            You ran {sessionQuestions.length || 15} rounds of Would You Rather with your team.
          </p>

          <div className="mt-8 pt-6 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => closeGummyGumSession()}
              className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer"
            >
              Done — Return to GummyGum →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
