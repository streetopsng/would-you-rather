import React, { useState } from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import Avatar from '../common/Avatar'
import { AVATAR_IDS, isAvatarId } from '../../lib/avatars'
import { IconArrowRight, IconCheck } from '../common/Icons'

export default function PlayerIdentity() {
  const { sessionName, player, savePlayerIdentity } = useGame()
  const [name, setName] = useState(player?.name || '')
  const [avatar, setAvatar] = useState(isAvatarId(player?.av) ? player.av : null)
  const [submitting, setSubmitting] = useState(false)

  const hasName = name.trim().length >= 2
  const canContinue = hasName && Boolean(avatar) && !submitting

  const handleContinue = () => {
    if (!canContinue) return
    setSubmitting(true)
    savePlayerIdentity(name.trim(), avatar)
  }

  const hint = !avatar
    ? 'Pick an avatar to continue'
    : !hasName
    ? 'Enter your name to continue'
    : 'Looking good! Tap to join the lobby.'

  return (
    <div className="w-full flex-1 flex flex-col">
      <Navbar title="Your Identity" contextText={sessionName} />

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 pb-40 md:pb-6 space-y-5">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-brand-black">
            Choose your avatar
          </h2>
          <p className="text-xs text-brand-mid mt-1">
            Then tap <span className="font-bold text-brand-black">Enter the lobby</span> below.
          </p>
        </div>

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

        <div className="bg-white border border-brand-border rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {AVATAR_IDS.map((id) => {
              const isSelected = avatar === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatar(id)}
                  aria-pressed={isSelected}
                  aria-label={`Avatar ${id.replace('av-', '')}`}
                  className={`relative aspect-square rounded-full p-0.5 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-orange ring-2 ring-brand-orange/30 scale-105'
                      : 'border-transparent hover:border-brand-border'
                  }`}
                >
                  <Avatar id={id} className="w-full h-full" />
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-orange text-brand-black flex items-center justify-center border-2 border-white">
                      <IconCheck className="w-3 h-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Fixed on mobile so the next step is always on screen, even mid-scroll through the grid */}
      <div className="fixed md:sticky bottom-0 inset-x-0 z-30 bg-brand-cream/95 backdrop-blur-xs border-t border-brand-border/60 px-4 py-3">
        <div className="max-w-md mx-auto flex flex-col items-center gap-1.5">
          <div className="w-full flex items-center gap-3">
            {avatar && <Avatar id={avatar} className="w-11 h-11 border-2 border-brand-orange" />}
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 ${
                canContinue
                  ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-black border border-brand-orange-hover shadow-xs cursor-pointer'
                  : 'bg-brand-border text-brand-muted cursor-not-allowed opacity-60'
              }`}
            >
              <span>{submitting ? 'Joining...' : 'Enter the lobby'}</span>
              <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-brand-muted">{hint}</p>
        </div>
      </div>
    </div>
  )
}
