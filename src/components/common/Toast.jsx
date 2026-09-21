import React from 'react'
import { useGame } from '../../context/useGame'

export default function Toast() {
  const { toastMessage } = useGame()

  if (!toastMessage) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-black text-brand-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg border border-brand-black transition-all duration-300 animate-slide-up whitespace-nowrap"
    >
      {toastMessage}
    </div>
  )
}
