import { describe, it, expect } from 'vitest'
import * as questionBankModule from '../data/questionBank'
import { QUESTION_BANK, CATEGORIES, AVATAR_OPTIONS } from '../data/questionBank'

describe('questionBank data integrity', () => {
  it('contains exactly 5 required categories', () => {
    expect(CATEGORIES).toEqual(['Fun', 'Work', 'Personality', 'Lifestyle', 'Silly'])
  })

  it('contains at least 10 valid questions per category with options a and b', () => {
    CATEGORIES.forEach((cat) => {
      const list = QUESTION_BANK[cat]
      expect(Array.isArray(list)).toBe(true)
      expect(list.length).toBeGreaterThanOrEqual(10)
      list.forEach((q) => {
        expect(typeof q.a).toBe('string')
        expect(q.a.trim().length).toBeGreaterThan(0)
        expect(typeof q.b).toBe('string')
        expect(q.b.trim().length).toBeGreaterThan(0)
      })
    })
  })

  it('contains 16 avatar options', () => {
    expect(AVATAR_OPTIONS.length).toBe(16)
  })

  it('contains no hardcoded mock participants', () => {
    expect(questionBankModule.INITIAL_PARTICIPANTS).toBeUndefined()
  })
})
