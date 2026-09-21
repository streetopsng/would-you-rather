import React from 'react'
import { useGame } from '../../context/useGame'
import { getPercentageWidthClass } from '../../utils/styleUtils'

export default function PlayerResults() {
  const {
    sessionName,
    sessionQuestions,
    playerQIdx,
    playerChoice,
    sessionVotes,
    nextPlayerQuestion,
  } = useGame()

  const currentQ = sessionQuestions[playerQIdx] || {
    cat: 'Fun',
    a: 'Loading...',
    b: 'Loading...',
  }

  // Calculate real percentages from real submitted votes
  const roundVotes = sessionVotes[playerQIdx] || {}
  const votes = Object.values(roundVotes)
  const votesA = votes.filter((v) => v === 'a').length
  const votesB = votes.filter((v) => v === 'b').length
  const totalVotes = votesA + votesB
  const pctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : playerChoice === 'a' ? 100 : 0
  const pctB = totalVotes > 0 ? 100 - pctA : playerChoice === 'b' ? 100 : 0

  const isLastQuestion = playerQIdx >= sessionQuestions.length - 1

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Session Header */}
      <div className="text-center pt-6 pb-2 px-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
          Results
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
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-center text-brand-black">
            Here's what the team picked
          </h3>

          <div className="space-y-5 bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
            {/* Row A */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-black">
                <span className="w-5 h-5 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-black shrink-0">
                  A
                </span>
                <span className="flex-1 truncate">{currentQ.a}</span>
                {playerChoice === 'a' && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange-light text-brand-orange-hover text-[10px] font-extrabold uppercase shrink-0">
                    Your pick
                  </span>
                )}
                <span className="font-black text-brand-black text-sm shrink-0">
                  {pctA}%
                </span>
              </div>
              <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
                <div
                  className={`h-full bg-brand-orange rounded-full transition-all duration-700 ease-out ${getPercentageWidthClass(
                    pctA
                  )}`}
                />
              </div>
            </div>

            {/* Row B */}
            <div className="space-y-2 pt-2 border-t border-brand-border/60">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-black">
                <span className="w-5 h-5 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-black shrink-0">
                  B
                </span>
                <span className="flex-1 truncate">{currentQ.b}</span>
                {playerChoice === 'b' && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange-light text-brand-orange-hover text-[10px] font-extrabold uppercase shrink-0">
                    Your pick
                  </span>
                )}
                <span className="font-black text-brand-black text-sm shrink-0">
                  {pctB}%
                </span>
              </div>
              <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
                <div
                  className={`h-full bg-brand-blue rounded-full transition-all duration-700 ease-out ${getPercentageWidthClass(
                    pctB
                  )}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Question Action */}
        <div className="mt-8 pt-4 border-t border-brand-border/60">
          <button
            type="button"
            onClick={nextPlayerQuestion}
            className="w-full py-4 px-6 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-base shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isLastQuestion ? 'Finish' : 'Next question'}</span>
            <span>&rsaquo;</span>
          </button>
        </div>
      </main>
    </div>
  )
}
