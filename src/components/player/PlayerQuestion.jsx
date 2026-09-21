import React, { useEffect } from 'react'
import { useGame } from '../../context/useGame'

export default function PlayerQuestion() {
  const {
    sessionName,
    sessionQuestions,
    playerQIdx,
    playerChoice,
    answerPlayerQuestion,
  } = useGame()

  const currentQ = sessionQuestions[playerQIdx] || {
    cat: 'Fun',
    a: 'Loading question...',
    b: 'Loading question...',
  }

  // Keyboard shortcut listener (A / B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (playerChoice) return
      if (e.key === 'a' || e.key === 'A' || e.key === '1') {
        answerPlayerQuestion('a')
      } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
        answerPlayerQuestion('b')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playerChoice, answerPlayerQuestion])

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Session / Round Header */}
      <div className="text-center pt-6 pb-2 px-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
          Question {playerQIdx + 1} of {sessionQuestions.length || 15}
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
          <h2 className="text-lg sm:text-xl font-black text-brand-black truncate">
            {sessionName}
          </h2>
          <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
        </div>
      </div>

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-orange-light text-brand-orange-hover text-xs font-black uppercase tracking-wider mb-2">
            {currentQ.cat}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black">
            Would you rather...
          </h1>
        </div>

        {/* Options */}
        <div className="space-y-3.5">
          {/* Option A */}
          <button
            type="button"
            onClick={() => answerPlayerQuestion('a')}
            disabled={Boolean(playerChoice)}
            className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all cursor-pointer ${
              playerChoice === 'a'
                ? 'border-brand-orange bg-brand-orange-light scale-[1.02] shadow-md'
                : playerChoice === 'b'
                ? 'opacity-40 border-brand-border bg-white'
                : 'border-brand-border bg-white hover:border-brand-orange hover:shadow-xs active:scale-[0.98]'
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
              A
            </span>
            <span className="text-sm sm:text-base font-bold text-brand-black leading-snug flex-1">
              {currentQ.a}
            </span>
          </button>

          <div className="text-center text-xs font-black text-brand-muted uppercase tracking-widest py-1">
            — OR —
          </div>

          {/* Option B */}
          <button
            type="button"
            onClick={() => answerPlayerQuestion('b')}
            disabled={Boolean(playerChoice)}
            className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all cursor-pointer ${
              playerChoice === 'b'
                ? 'border-brand-orange bg-brand-orange-light scale-[1.02] shadow-md'
                : playerChoice === 'a'
                ? 'opacity-40 border-brand-border bg-white'
                : 'border-brand-border bg-white hover:border-brand-orange hover:shadow-xs active:scale-[0.98]'
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs">
              B
            </span>
            <span className="text-sm sm:text-base font-bold text-brand-black leading-snug flex-1">
              {currentQ.b}
            </span>
          </button>
        </div>

        <p className="text-center text-xs text-brand-muted mt-6">
          Tip: You can also press <kbd className="px-1.5 py-0.5 rounded bg-brand-cream border border-brand-border font-mono text-[11px] font-bold">A</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-brand-cream border border-brand-border font-mono text-[11px] font-bold">B</kbd> on your keyboard
        </p>
      </main>
    </div>
  )
}
