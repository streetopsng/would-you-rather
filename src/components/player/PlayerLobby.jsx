import React from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerLobby() {
  const { sessionName, player, joinedPlayers, startPlayerGame } = useGame()

  const otherPlayers = joinedPlayers.filter(
    (p) => (p.id && p.id !== player.id) || (p.email && p.email !== player.email)
  )

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Session Header */}
      <div className="text-center pt-6 pb-2 px-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
          Session
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-brand-black truncate">
            {sessionName}
          </h2>
          <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
        </div>
      </div>

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="space-y-4">
          {/* You Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-brand-orange-light border-2 border-brand-orange flex items-center justify-center text-2xl shrink-0">
              {player.av || '🙂'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black text-brand-black truncate">
                {player.name || 'You'}
              </div>
              <div className="text-xs text-brand-muted truncate">
                {player.email || 'Ready to play'}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-brand-orange-light border border-brand-orange text-brand-orange-hover text-xs font-black">
              ✓ Ready
            </div>
          </div>

          {/* Also Ready Section */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-brand-mid px-2 mb-2">
              Joined Teammates ({otherPlayers.length})
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-2 shadow-xs divide-y divide-brand-border/60 max-h-[260px] overflow-y-auto">
              {otherPlayers.length === 0 ? (
                <div className="py-6 text-center text-xs text-brand-muted">
                  You're the first player here! Waiting for other teammates to join...
                </div>
              ) : (
                otherPlayers.map((p) => (
                  <div
                    key={p.id || p.email}
                    className="py-2.5 px-3 flex items-center gap-3 animate-row-in"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-orange-light border border-brand-orange/60 flex items-center justify-center text-base shrink-0">
                      {p.av || '🙂'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-brand-black truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-brand-muted truncate">
                        {p.email || 'Teammate'}
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-green shrink-0 shadow-xs" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Waiting status */}
          <div className="flex items-center gap-2.5 px-3 py-2 text-xs text-brand-mid font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-blink shrink-0" />
            <span>Waiting for the host to start the round...</span>
          </div>
        </div>

        {/* Enter Round Action */}
        <div className="mt-8 pt-4 border-t border-brand-border/60">
          <button
            type="button"
            onClick={startPlayerGame}
            className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start answering now</span>
            <span>&rsaquo;</span>
          </button>
        </div>
      </main>
    </div>
  )
}
