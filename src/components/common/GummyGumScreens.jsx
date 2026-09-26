import React from 'react'
import { returnToGummyGum } from '../../lib/gummygumSession'

export const GummyGumLockedScreen = () => (
  <div className="min-h-screen w-full bg-[#EDEAE4] text-[#1A1A1A] flex items-center justify-center p-6">
    <div className="max-w-md w-full p-8 text-center space-y-4 bg-white border-[1.5px] border-[#E0DBD4] rounded-[24px] shadow-[0_4px_0_#E0DBD4]">
      <div className="text-5xl">🔒</div>
      <h1 className="text-2xl font-black text-[#1A1A1A]">Launch from GummyGum</h1>
      <p className="text-[#555] text-sm leading-relaxed">
        This experience is exclusively available through the GummyGum Hub. Open it from your GummyGum dashboard to start or join a session.
      </p>
      <a
        href="https://gummygum.app"
        className="inline-block mt-3 px-6 py-3 rounded-xl bg-[#F5821F] text-[#1A1A1A] font-extrabold hover:bg-[#E07212] transition-colors shadow-sm cursor-pointer"
      >
        Go to GummyGum
      </a>
    </div>
  </div>
)

export const GummyGumCancelledScreen = ({ isHost = false }) => (
  <div className="min-h-screen w-full bg-[#EDEAE4] text-[#1A1A1A] flex items-center justify-center p-6">
    <div className="max-w-md w-full p-8 text-center space-y-4 bg-white border-[1.5px] border-[#E0DBD4] rounded-[24px] shadow-[0_4px_0_#E0DBD4]">
      <div className="text-5xl">👋</div>
      <h1 className="text-2xl font-black text-[#1A1A1A]">Session Ended</h1>
      <p className="text-[#555] text-sm leading-relaxed">
        {isHost
          ? 'This session was ended. You can return to GummyGum to launch another experience.'
          : 'This session was ended by the host. You can safely close this tab now.'}
      </p>
      {isHost ? (
        <button
          type="button"
          onClick={() => returnToGummyGum()}
          className="inline-block mt-3 px-6 py-3 rounded-xl bg-[#F5821F] text-[#1A1A1A] font-extrabold hover:bg-[#E07212] transition-colors shadow-sm cursor-pointer"
        >
          Return to GummyGum
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            try { window.close() } catch {}
          }}
          className="inline-block mt-3 px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#E0DBD4] text-stone-700 font-bold transition-colors cursor-pointer text-sm"
        >
          Close Tab
        </button>
      )}
    </div>
  </div>
)
