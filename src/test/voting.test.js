import { describe, it, expect } from 'vitest'

function calculateVotePercentages(roundVotes) {
  const votes = Object.values(roundVotes || {})
  const votesA = votes.filter((v) => v === 'a').length
  const votesB = votes.filter((v) => v === 'b').length
  const total = votesA + votesB
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 0
  const pctB = total > 0 ? 100 - pctA : 0
  return { votesA, votesB, total, pctA, pctB }
}

describe('Real vote tallying logic', () => {
  it('handles zero votes correctly', () => {
    const result = calculateVotePercentages({})
    expect(result).toEqual({ votesA: 0, votesB: 0, total: 0, pctA: 0, pctB: 0 })
  })

  it('handles unanimous vote for option a', () => {
    const votes = {
      p1: 'a',
      p2: 'a',
      p3: 'a',
    }
    const result = calculateVotePercentages(votes)
    expect(result).toEqual({ votesA: 3, votesB: 0, total: 3, pctA: 100, pctB: 0 })
  })

  it('handles unanimous vote for option b', () => {
    const votes = {
      p1: 'b',
      p2: 'b',
    }
    const result = calculateVotePercentages(votes)
    expect(result).toEqual({ votesA: 0, votesB: 2, total: 2, pctA: 0, pctB: 100 })
  })

  it('handles split votes accurately', () => {
    const votes = {
      p1: 'a',
      p2: 'b',
      p3: 'a',
      p4: 'b',
    }
    const result = calculateVotePercentages(votes)
    expect(result).toEqual({ votesA: 2, votesB: 2, total: 4, pctA: 50, pctB: 50 })
  })

  it('handles 3:1 split votes accurately', () => {
    const votes = {
      p1: 'a',
      p2: 'a',
      p3: 'a',
      p4: 'b',
    }
    const result = calculateVotePercentages(votes)
    expect(result).toEqual({ votesA: 3, votesB: 1, total: 4, pctA: 75, pctB: 25 })
  })
})
