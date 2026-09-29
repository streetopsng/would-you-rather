import React from 'react'
import { returnToGummyGum } from '../../lib/gummygumSession'
import { IconLock, IconLogOut, IconCheckCircle } from './Icons'

export const GummyGumLockedScreen = () => (
  <div className="min-h-screen w-full bg-[#EDEAE4] text-[#1A1A1A] flex items-center justify-center p-6">
    <div className="max-w-md w-full p-8 text-center space-y-4 bg-white border-[1.5px] border-[#E0DBD4] rounded-[24px] shadow-[0_4px_0_#E0DBD4]">
      <div className="w-14 h-14 rounded-2xl bg-[#FDE8D0] text-[#F5821F] flex items-center justify-center mx-auto">
        <IconLock className="w-7 h-7" />
      </div>
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

export const GummyGumCancelledScreen = ({ isHost = false, completed = false }) => (
  <div className="min-h-screen w-full bg-[#EDEAE4] text-[#1A1A1A] flex items-center justify-center p-6">
    <div className="max-w-md w-full p-8 text-center space-y-4 bg-white border-[1.5px] border-[#E0DBD4] rounded-[24px] shadow-[0_4px_0_#E0DBD4]">
      <div className="w-14 h-14 rounded-2xl bg-[#FDE8D0] text-[#F5821F] flex items-center justify-center mx-auto">
        {completed ? <IconCheckCircle className="w-7 h-7" /> : <IconLogOut className="w-7 h-7" />}
      </div>
      <h1 className="text-2xl font-black text-[#1A1A1A]">{completed ? 'Session Complete' : 'Session Ended'}</h1>
      <p className="text-[#555] text-sm leading-relaxed">
        {isHost
          ? 'This session was ended. You can return to GummyGum to launch another experience.'
          : completed
          ? 'Thanks for playing! This session is complete. You can close this tab now.'
          : 'The host ended this session. You can close this tab now.'}
      </p>
      {isHost && (
        <button
          type="button"
          onClick={() => returnToGummyGum()}
          className="inline-block mt-3 px-6 py-3 rounded-xl bg-[#F5821F] text-[#1A1A1A] font-extrabold hover:bg-[#E07212] transition-colors shadow-sm cursor-pointer"
        >
          Return to GummyGum
        </button>
      )}
    </div>
  </div>
)
