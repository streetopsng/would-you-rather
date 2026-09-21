import React from 'react'
import { useGame } from '../../context/useGame'

export default function HostHome() {
  const { setCurrentScreen } = useGame()

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Top Hero Banner */}
      <div className="bg-brand-orange text-brand-black px-6 pt-12 pb-16 md:py-20 text-center rounded-b-3xl md:rounded-3xl shadow-sm">
        <div className="max-w-xl mx-auto">
          <span className="text-xs font-black tracking-widest uppercase opacity-70">
            GummyGum
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mt-3 leading-tight tracking-tight">
            Would You<br className="sm:hidden" /> Rather?
          </h1>
          <p className="text-sm sm:text-base font-medium opacity-80 mt-3 max-w-sm sm:max-w-md mx-auto leading-relaxed">
            Quick two-choice questions that spark conversation — no prep needed.
          </p>
        </div>
      </div>

      {/* Action Sheet / Card */}
      <div className="flex-1 -mt-6 max-w-xl w-full mx-auto px-4 sm:px-6 pb-12 flex flex-col">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-brand-border flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-brand-black text-center sm:text-left">
              Host a Team Session
            </h2>
            <p className="text-xs sm:text-sm text-brand-mid leading-relaxed text-center sm:text-left">
              Pick your rounds, invite your teammates with automated Brevo email links, and run a live show on your screen.
            </p>

            {/* Quick feature list for desktop */}
            <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-brand-cream/80 border border-brand-border/60">
                <span className="text-base">⚡</span>
                <div className="text-xs font-bold text-brand-black mt-1">Zero Setup for Players</div>
                <div className="text-[11px] text-brand-muted">Teammates join via email link without creating accounts</div>
              </div>
              <div className="p-3 rounded-2xl bg-brand-cream/80 border border-brand-border/60">
                <span className="text-base">📊</span>
                <div className="text-xs font-bold text-brand-black mt-1">Live Team Polls</div>
                <div className="text-[11px] text-brand-muted">Instant percentage bars and surprise picks</div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setCurrentScreen('host-setup')}
              className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create a game</span>
              <span>&rsaquo;</span>
            </button>

            <p className="text-center text-xs text-brand-muted leading-relaxed">
              Employees join via an email invite sent by GummyGum — no code needed on their end.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
