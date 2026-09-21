import React, { useState } from 'react'
import { AVATAR_OPTIONS } from '../../data/questionBank'
import { useGame } from '../../context/useGame'

export default function AvatarModal({ currentAvatar, onSelectAvatar }) {
  const { isAvatarModalOpen, setIsAvatarModalOpen } = useGame()
  const [selected, setSelected] = useState(currentAvatar || '🙂')

  if (!isAvatarModalOpen) return null

  const handleConfirm = () => {
    onSelectAvatar(selected)
    setIsAvatarModalOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAvatarModalOpen(false)
      }}
    >
      <div className="w-full max-w-sm bg-brand-cream rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-none border border-brand-border">
        <h3 className="text-base sm:text-lg font-black text-center text-brand-black mb-5">
          Choose your avatar
        </h3>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {AVATAR_OPTIONS.map((emoji) => {
            const isSelected = selected === emoji
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelected(emoji)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-3xl bg-white border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-orange scale-110 shadow-md ring-2 ring-brand-orange/30'
                    : 'border-transparent hover:border-brand-border hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3.5 px-5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-sm shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer"
          >
            Confirm selection
          </button>
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(false)}
            className="text-xs font-bold text-brand-mid hover:text-brand-black underline px-2 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
