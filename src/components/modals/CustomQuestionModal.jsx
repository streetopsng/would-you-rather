import React, { useState } from 'react'
import { CATEGORIES } from '../../data/questionBank'
import { useGame } from '../../context/useGame'

export default function CustomQuestionModal() {
  const { isCustomQModalOpen, setIsCustomQModalOpen, addCustomQuestion } = useGame()
  const [selectedCat, setSelectedCat] = useState('Fun')
  const [optA, setOptA] = useState('')
  const [optB, setOptB] = useState('')

  if (!isCustomQModalOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    const saved = addCustomQuestion(selectedCat, optA, optB)
    if (saved) {
      setOptA('')
      setOptB('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCustomQModalOpen(false)
      }}
    >
      <div className="w-full max-w-md bg-brand-cream rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-none border border-brand-border">
        <h3 className="text-base sm:text-lg font-black text-center text-brand-black mb-4">
          Add your own question
        </h3>

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-brand-mid mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors cursor-pointer ${
                    selectedCat === cat
                      ? 'bg-brand-orange-light border-brand-orange text-brand-orange-hover'
                      : 'bg-white border-brand-border text-brand-black hover:border-brand-mid/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-brand-mid mb-1.5">
              Option A
            </label>
            <input
              type="text"
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              placeholder="e.g. work from a beach for a month"
              maxLength={90}
              className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-black outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/40 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-brand-mid mb-1.5">
              Option B
            </label>
            <input
              type="text"
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              placeholder="e.g. work from the mountains for a month"
              maxLength={90}
              className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-black outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 px-5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-brand-black font-extrabold text-sm shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)] transition-all cursor-pointer"
            >
              Save question
            </button>
            <button
              type="button"
              onClick={() => setIsCustomQModalOpen(false)}
              className="text-xs font-bold text-brand-mid hover:text-brand-black underline px-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
