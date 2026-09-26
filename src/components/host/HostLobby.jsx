import React from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import { getPercentageWidthClass } from '../../utils/styleUtils'
import { closeGummyGumSession } from '../../lib/gummygumSession'
import { endSession } from '../../services/firebase'

export default function HostLobby() {
  const {
    sessionName,
    sessionId,
    participants,
    joinedPlayers,
    startHostGame,
    showToast,
    ggSession,
    invitedCount,
  } = useGame()

  const queryParams = new URLSearchParams(window.location.search)
  const queryInvited = queryParams.get('invitedCount')
  const invited = participants.filter((p) => p.selected)
  const joinedCount = joinedPlayers.length
  const totalCount =
    invitedCount ||
    ggSession?.invitedCount ||
    (queryInvited ? parseInt(queryInvited, 10) : null) ||
    Math.max(invited.length, joinedCount, 1)
  const pctJoined = totalCount > 0 ? Math.min(100, Math.round((joinedCount / totalCount) * 100)) : 0
  const canStart = joinedCount >= 1

  const handleCopyInviteLink = () => {
    const hubUrl = ggSession?.hubUrl || 'https://gummygum.app'
    const inviteUrl = `${hubUrl}/join?pin=${sessionId}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl)
      showToast('1-click invite link copied to clipboard!')
    } else {
      showToast(`Link: ${inviteUrl}`)
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <Navbar contextText={sessionName} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-28 md:pb-8 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Progress Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 text-center shadow-xs">
            <div className="text-4xl sm:text-5xl font-black text-brand-orange leading-none">
              <span>{joinedCount}</span>
              <span className="text-brand-muted text-2xl sm:text-3xl font-bold">
                /{totalCount}
              </span>
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-brand-muted mt-2">
              Players joined
            </div>

            {/* Bar */}
            <div className="w-full h-2.5 bg-brand-border rounded-full overflow-hidden mt-4">
              <div
                className={`h-full bg-brand-orange rounded-full transition-all duration-500 ease-out ${getPercentageWidthClass(
                  pctJoined
                )}`}
              />
            </div>

            {/* Share Invite Box */}
            <div className="mt-5 pt-4 border-t border-brand-border/60 bg-brand-cream/30 rounded-xl p-3.5 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-brand-muted tracking-wider">
                  Room PIN
                </span>
                <span className="text-base font-black font-mono text-brand-orange tracking-widest">
                  {sessionId}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-brand-border/40">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase text-brand-muted tracking-wider mb-0.5">
                    1-Click Invite Link
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-black truncate block">
                    {(ggSession?.hubUrl || 'https://gummygum.app')}/join?pin={sessionId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-3 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-bold text-brand-orange hover:text-brand-orange-hover hover:bg-brand-orange-light/30 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Invited & Joined Players List */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-brand-mid">
                Lobby Roster
              </span>
              <span className="text-[11px] font-bold text-brand-muted">
                {joinedCount} in lobby
              </span>
            </div>

            {joinedPlayers.length === 0 ? (
              <div className="py-10 text-center text-xs text-brand-muted space-y-2">
                <span className="w-3 h-3 rounded-full bg-brand-orange animate-pulse inline-block" />
                <p>Waiting for players to open their email invite link and join...</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/60 max-h-[300px] overflow-y-auto pr-1">
                {joinedPlayers.map((p) => (
                  <div
                    key={p.id || p.email}
                    className="py-3 px-2 flex items-center gap-3 rounded-xl bg-emerald-50/40"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border bg-brand-orange-light border-brand-orange">
                      {p.av || '🙂'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-brand-black truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-brand-muted truncate">
                        {p.email || 'Joined Teammate'}
                      </div>
                    </div>

                    <div className="text-xs font-extrabold text-brand-green flex items-center gap-1 shrink-0">
                      <span>✓</span> Joined
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="mt-8 pt-4 border-t border-brand-border/60 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={startHostGame}
            disabled={!canStart}
            className={`w-full max-w-md py-4 px-6 rounded-full font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              canStart
                ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-black shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)]'
                : 'bg-brand-border text-brand-muted cursor-not-allowed opacity-60'
            }`}
          >
            <span>Start game</span>
            <span>&rsaquo;</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('End this session and return to GummyGum?')) {
                endSession(sessionId).finally(() => closeGummyGumSession())
              }
            }}
            className="w-full max-w-md py-2.5 px-4 rounded-full border border-brand-border hover:border-red-300 text-xs font-bold text-brand-muted hover:text-red-600 bg-white hover:bg-red-50/50 transition-all cursor-pointer shadow-xs mt-1"
          >
            Close Session & Return to GummyGum
          </button>
          <p className="text-center text-xs text-brand-muted max-w-sm leading-relaxed">
            {canStart
              ? `${joinedCount} teammate${joinedCount > 1 ? 's' : ''} in the lobby — ready to roll.`
              : 'Waiting for at least one teammate to join before starting.'}
          </p>
        </div>
      </main>
    </div>
  )
}
