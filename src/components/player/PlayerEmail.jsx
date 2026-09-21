import React, { useState } from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerEmail() {
  const { sessionName, submitPlayerEmailInput, showToast } = useGame()
  const [email, setEmail] = useState('')

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email.trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValidEmail) {
      showToast('Enter a valid work email')
      return
    }
    submitPlayerEmailInput(email.trim())
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-md text-center">
        <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
          Confirm it's you
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black mt-2 mb-3">
          What's your work email?
        </h1>
        <p className="text-xs sm:text-sm text-brand-mid mb-6 leading-relaxed">
          We'll match you to the invite for{' '}
          <strong className="text-brand-black">{sessionName}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-brand-cream/50 border border-brand-border rounded-xl px-4 py-3.5 text-center text-sm sm:text-base font-semibold text-brand-black outline-none focus:border-brand-orange focus:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={!isValidEmail}
            className={`w-full py-4 px-6 rounded-full font-extrabold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isValidEmail
                ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-black shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)]'
                : 'bg-brand-border text-brand-muted cursor-not-allowed opacity-60'
            }`}
          >
            <span>Continue</span>
            <span>&rsaquo;</span>
          </button>
        </form>
      </div>
    </div>
  )
}
