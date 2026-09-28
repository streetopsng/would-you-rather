import React from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import { closeGummyGumSession } from '../../lib/gummygumSession'
import { IconFlag, IconArrowRight } from '../common/Icons'

export default function HostFinish() {
  const { sessionName, sessionQuestions, setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <Navbar title="Session Complete" contextText={sessionName} />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center text-center">
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-xs w-full">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange-light border border-brand-orange/60 flex items-center justify-center text-brand-orange-hover mx-auto mb-4">
            <IconFlag className="w-6 h-6" />
          </div>
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
              className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base border border-brand-orange-hover shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Done — Return to GummyGum</span>
              <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
