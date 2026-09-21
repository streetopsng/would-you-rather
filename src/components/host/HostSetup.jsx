import React, { useState } from 'react'
import { useGame } from '../../context/useGame'
import Navbar from '../common/Navbar'

export default function HostSetup() {
  const {
    sessionName,
    setSessionName,
    roundCount,
    setRoundCount,
    participants,
    addParticipant,
    removeParticipant,
    toggleParticipant,
    selectAllParticipants,
    setIsCustomQModalOpen,
    launchHostSession,
  } = useGame()

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDept, setNewDept] = useState('')

  const handleAddTeammate = (e) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return
    const success = addParticipant(newName, newEmail, newDept || 'Team')
    if (success) {
      setNewName('')
      setNewEmail('')
      setNewDept('')
    }
  }

  const selectedCount = participants.filter((p) => p.selected).length
  const allSelected = participants.length > 0 && selectedCount === participants.length

  return (
    <div className="w-full flex-1 flex flex-col">
      <Navbar contextText="Host Setup" />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-28 md:pb-8 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Session Configuration */}
          <div className="md:col-span-5 space-y-4">
            {/* Session Name Card */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
              <label
                htmlFor="sessionName"
                className="block text-xs font-black uppercase tracking-wider text-brand-mid mb-2"
              >
                Session name
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. Team Bonding"
                className="w-full bg-brand-cream/50 border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand-black outline-none focus:border-brand-orange focus:bg-white transition-colors"
              />
            </div>

            {/* Rounds Selector Card */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
              <span className="block text-xs font-black uppercase tracking-wider text-brand-mid mb-1">
                Rounds
              </span>
              <p className="text-xs text-brand-muted mb-3 leading-relaxed">
                Questions are auto-picked and mixed across all 5 categories.
              </p>

              <div className="flex gap-2">
                {[10, 15, 20].map((count) => {
                  const isSelected = roundCount === count
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRoundCount(count)}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-orange bg-brand-orange-light text-brand-orange-hover shadow-xs'
                          : 'border-brand-border bg-white text-brand-black hover:border-brand-mid/40'
                      }`}
                    >
                      {count} rounds
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-brand-border/60 text-center">
                <button
                  type="button"
                  onClick={() => setIsCustomQModalOpen(true)}
                  className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                >
                  + Add your own question
                </button>
              </div>
            </div>

            {/* Email Dispatch Card for Host */}
            <div className="hidden md:block bg-brand-cream/70 border border-brand-border rounded-2xl p-4 text-xs text-brand-mid">
              <div className="font-bold text-brand-black flex items-center gap-1.5 mb-1">
                <span>✉️</span> Automated Email Invitations
              </div>
              <p className="leading-relaxed text-[11px] text-brand-muted">
                When you launch the session, GummyGum will automatically email direct invitation links to every selected teammate.
              </p>
            </div>
          </div>

          {/* Right Column: Team Picker Card */}
          <div className="md:col-span-7 space-y-4">
            {/* Add Teammate Form */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-black uppercase tracking-wider text-brand-mid mb-3">
                Add Teammate to Invite
              </div>
              <form onSubmit={handleAddTeammate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name (e.g. Sarah)"
                    className="bg-brand-cream/50 border border-brand-border rounded-xl px-3 py-2 text-xs font-medium text-brand-black outline-none focus:border-brand-orange focus:bg-white"
                  />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="bg-brand-cream/50 border border-brand-border rounded-xl px-3 py-2 text-xs font-medium text-brand-black outline-none focus:border-brand-orange focus:bg-white"
                  />
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="Dept (optional)"
                    className="bg-brand-cream/50 border border-brand-border rounded-xl px-3 py-2 text-xs font-medium text-brand-black outline-none focus:border-brand-orange focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newName.trim() || !newEmail.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-black hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  + Add teammate
                </button>
              </form>
            </div>

            {/* Teammates List Card */}
            <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-black uppercase tracking-wider text-brand-mid">
                  Teammates ·{' '}
                  <span className="text-brand-orange font-bold">
                    {selectedCount} selected
                  </span>
                </div>
                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllParticipants}
                    className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </button>
                )}
              </div>
              <p className="text-xs text-brand-muted mb-3">
                Select who will receive email invites for this session
              </p>

              {participants.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-brand-border rounded-xl">
                  <span className="text-2xl">👥</span>
                  <div className="text-xs font-bold text-brand-black mt-2">No teammates added yet</div>
                  <p className="text-[11px] text-brand-muted mt-0.5">Use the form above to add your team members</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-border/60 overflow-y-auto max-h-[260px] pr-1">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="py-2.5 px-2 flex items-center gap-3 rounded-xl hover:bg-brand-cream/40 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleParticipant(p.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-black transition-colors cursor-pointer shrink-0 ${
                          p.selected
                            ? 'bg-brand-orange border-brand-orange text-white'
                            : 'border-brand-border bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </button>

                      <div className="w-7 h-7 rounded-full bg-brand-orange-light border border-brand-orange/60 flex items-center justify-center text-sm shrink-0">
                        {p.av}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-brand-black truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-brand-muted truncate">
                          {p.dept} · {p.email}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeParticipant(p.id)}
                        title="Remove teammate"
                        className="text-stone-400 hover:text-rose-500 text-xs px-2 py-1 font-bold cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Launch Actions */}
        <div className="mt-6 pt-4 border-t border-brand-border/60 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={launchHostSession}
            disabled={selectedCount === 0}
            className={`w-full max-w-md py-4 px-6 rounded-full font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedCount > 0
                ? 'bg-brand-orange hover:bg-brand-orange-hover text-brand-black shadow-[0_4px_0_theme(colors.brand.orange-hover)] active:translate-y-0.5 active:shadow-[0_2px_0_theme(colors.brand.orange-hover)]'
                : 'bg-brand-border text-brand-muted cursor-not-allowed opacity-60'
            }`}
          >
            <span>Launch session — notify team</span>
            <span>&rsaquo;</span>
          </button>
          <p className="text-center text-xs text-brand-muted max-w-sm leading-relaxed">
            GummyGum will email each selected teammate a direct link. You'll land in the lobby to watch them join.
          </p>
        </div>
      </main>
    </div>
  )
}
