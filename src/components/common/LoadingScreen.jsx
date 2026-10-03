import React, { useEffect, useState } from 'react'
import { IconHelpCircle } from './Icons'

const SLOW_MESSAGE = 'Still connecting… please wait'
const STALLED_MESSAGE = "This is taking longer than usual — check your internet connection. We'll keep trying."

export default function LoadingScreen({ message = 'Loading…', progressive = false }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!progressive) return
    const slow = setTimeout(() => setStage(1), 8000)
    const stalled = setTimeout(() => setStage(2), 20000)
    return () => {
      clearTimeout(slow)
      clearTimeout(stalled)
    }
  }, [progressive])

  const text = stage === 2 ? STALLED_MESSAGE : stage === 1 ? SLOW_MESSAGE : message

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FDE8D0] border-2 border-[#F5821F]/30 flex items-center justify-center text-[#F5821F] animate-bounce">
          <IconHelpCircle className="w-8 h-8" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-[#F5821F] border-t-transparent animate-spin" />
      </div>
      <div className="text-sm font-black uppercase tracking-wider text-[#F5821F] mb-1">
        Would You Rather
      </div>
      <p className="text-xs font-semibold text-[#888] max-w-xs">{text}</p>
    </div>
  )
}
