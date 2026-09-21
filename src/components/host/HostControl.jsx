import React from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'
import { getPercentageWidthClass } from '../../utils/styleUtils'

export default function HostControl() {
  const {
    sessionName,
    sessionQuestions,
    hostQIdx,
    sessionVotes,
    isRevealed,
    revealHostResults,
    nextHostQuestion,
    joinedPlayers,
    participants,
  } = useGame()

  const currentQ = sessionQuestions[hostQIdx] || {
    cat: 'Fun',
    a: 'Loading question...',
    b: 'Loading question...',
  }

  const totalPlayers = joinedPlayers.length || participants.filter((p) => p.selected).length || 1
  const roundVotes = sessionVotes[hostQIdx] || {}
  const votes = Object.values(roundVotes)
  const votesA = votes.filter((v) => v === 'a').length
  const votesB = votes.filter((v) => v === 'b').length
  const totalVotes = votesA + votesB

  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 0
  const pctB = totalVotes > 0 ? 100 - pctA : 0

  const isLastQuestion = hostQIdx >= sessionQuestions.length - 1

  return (
    <div className="w-full flex-1 flex flex-col">
      <Navbar contextText={sessionName} />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-28 md:pb-8 flex flex-col justify-between">
        <div>
          {/* Round Header */}
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-brand-muted">
              Question {hostQIdx + 1} of {sessionQuestions.length || 15}
            </span>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-orange-light text-brand-orange-hover text-xs font-black uppercase tracking-wider">
              {currentQ.cat}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-black mt-3">
              Would you rather...
            </h2>
          </div>

          {/* Options Display */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Option A */}
            <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-xs transition-all">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-black text-white flex items-center justify-center font-black text-sm shrink-0">
                  A
                </span>
                <div className="flex-1 text-base sm:text-lg font-bold text-brand-black pt-0.5 leading-snug">
                  {currentQ.a}
                </div>
              </div>

              {/* Bar and Stats */}
              <div className="mt-4">
                <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-brand-orange rounded-full transition-all duration-700 ease-out ${
                      isRevealed ? getPercentageWidthClass(pctA) : 'w-0'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs font-bold text-brand-mid">
                  <span>{isRevealed ? `${votesA} votes` : ''}</span>
                  <span className="text-sm font-black text-brand-black">
                    {isRevealed ? `${pctA}%` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* OR Divider */}
            <div className="text-center font-black text-xs uppercase tracking-widest text-brand-muted py-1">
              — OR —
            </div>

            {/* Option B */}
            <div className="bg-white border-2 border-brand-border rounded-2xl p-5 shadow-xs transition-all">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-black text-white flex items-center justify-center font-black text-sm shrink-0">
                  B
                </span>
                <div className="flex-1 text-base sm:text-lg font-bold text-brand-black pt-0.5 leading-snug">
                  {currentQ.b}
                </div>
              </div>

              {/* Bar and Stats */}
              <div className="mt-4">
                <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-brand-blue rounded-full transition-all duration-700 ease-out ${
                      isRevealed ? getPercentageWidthClass(pctB) : 'w-0'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs font-bold text-brand-mid">
                  <span>{isRevealed ? `${votesB} votes` : ''}</span>
                  <span className="text-sm font-black text-brand-black">
                    {isRevealed ? `${pctB}%` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Responses Indicator */}
            <div className="text-center text-xs font-bold text-brand-muted mt-4">
              {totalVotes} / {totalPlayers} answered
            </div>
          </div>
        </div>

        {/* Host Control Actions */}
        <div className="mt-8 pt-4 border-t border-brand-border/60 flex flex-col items-center">
          {!isRevealed ? (
            <button
              type="button"
              onClick={revealHostResults}
              className="w-full max-w-md py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Reveal results</span>
              <span>&rsaquo;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={nextHostQuestion}
              className="w-full max-w-md py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLastQuestion ? 'Finish session' : 'Next question'}</span>
              <span>&rsaquo;</span>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
