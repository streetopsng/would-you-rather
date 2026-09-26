import React, { useState } from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import AvatarModal from '../modals/AvatarModal'

export default function PlayerIdentity() {
  const { sessionName, player, savePlayerIdentity, setIsAvatarModalOpen } = useGame()
  const [name, setName] = useState(player?.name || '')
  const [avatar, setAvatar] = useState(player?.av || '🦊')

  const canContinue = name.trim().length >= 2

  const handleContinue = () => {
    if (!canContinue) return
    savePlayerIdentity(name.trim(), avatar)
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <Navbar title="Your Identity" contextText={sessionName} />

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-xs text-center flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-24 h-24 rounded-full bg-brand-orange-light border-3 border-brand-black flex items-center justify-center text-5xl hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
            >
              {avatar}
            </button>

            <div className="text-lg font-extrabold text-brand-black mt-3">
              {name.trim() || '—'}
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-brand-cream hover:bg-stone-200 text-xs font-bold text-brand-black transition-colors flex items-center gap-1.5 cursor-pointer border border-brand-border/60"
            >
              <span>🎨</span> Choose avatar
            </button>
          </div>

          {/* Name Input — only shown if player name not already known from GummyGum */}
          {!player?.name && (
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
              <label
                htmlFor="playerName"
                className="block text-xs font-black uppercase tracking-wider text-brand-mid mb-2"
              >
                Your name
              </label>
              <input
                id="playerName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full bg-brand-cream/50 border border-brand-border rounded-xl px-4 py-3 text-sm font-bold text-brand-black outline-none focus:border-brand-orange focus:bg-white transition-colors"
              />
            </div>
          )}
        </div>

        {/* Enter Lobby Action */}
        <div className="mt-8 pt-4 border-t border-brand-border/60 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              canContinue
                ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-black shadow-[0_3px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_1px_0_theme(colors.brand.orange-hover)]'
                : 'bg-brand-border text-brand-muted cursor-not-allowed opacity-60'
            }`}
          >
            <span>Enter the lobby</span>
            <span>&rarr;</span>
          </button>
          <p className="text-xs text-brand-muted">
            {canContinue ? 'Looking good!' : 'Enter your name to continue'}
          </p>
        </div>
      </main>

      <AvatarModal
        currentAvatar={avatar}
        onSelectAvatar={(newAv) => setAvatar(newAv)}
      />
    </div>
  )
}
