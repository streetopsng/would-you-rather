import React from 'react'

export default function GameRulesModal({ onConfirm, name }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-brand-border rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fadeUp flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-light border border-brand-orange/30 text-brand-orange-hover text-[11px] font-extrabold uppercase tracking-wider mb-2">
            Game Overview
          </div>
          <h3 className="text-2xl sm:text-[26px] font-black text-brand-black tracking-tight">
            How Would You Rather Works
          </h3>
          <p className="text-xs sm:text-[13px] text-brand-mid mt-1.5 leading-relaxed">
            Welcome{name ? `, ${name}` : ''}! Before you enter the room, here's what to expect in this experience.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-cream/60 border border-brand-border">
            <div className="w-8 h-8 rounded-xl bg-brand-orange-light text-brand-orange-hover font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              1
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-brand-black">Pick your side</div>
              <div className="text-[11.5px] text-brand-mid mt-0.5 leading-snug">
                Each round presents two wild, hilarious, or tricky choices. Pick the one you'd rather do!
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-cream/60 border border-brand-border">
            <div className="w-8 h-8 rounded-xl bg-brand-orange-light text-brand-orange-hover font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              2
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-brand-black">See how the team voted</div>
              <div className="text-[11.5px] text-brand-mid mt-0.5 leading-snug">
                Watch votes lock in live. See who voted like you and who went the complete opposite direction!
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-cream/60 border border-brand-border">
            <div className="w-8 h-8 rounded-xl bg-brand-orange-light text-brand-orange-hover font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              3
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-brand-black">Debate & connect</div>
              <div className="text-[11.5px] text-brand-mid mt-0.5 leading-snug">
                Uncover surprising facts about teammates, spark fun debates, and break the ice.
              </div>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-left flex items-center gap-2.5 mb-6">
          <span className="text-base shrink-0">💡</span>
          <span className="text-[11.5px] text-amber-900 font-medium leading-snug">
            <strong>Pro tip:</strong> Don't overthink it — go with your gut feeling and get ready to defend your answer!
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 text-sm font-extrabold rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-brand-black shadow-[0_3px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          Got it, enter lobby →
        </button>
      </div>
    </div>
  )
}
