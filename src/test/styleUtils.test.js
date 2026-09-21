import { describe, it, expect } from 'vitest'
import { getPercentageWidthClass } from '../utils/styleUtils'

describe('styleUtils - getPercentageWidthClass', () => {
  it('returns w-0 for 0%', () => {
    expect(getPercentageWidthClass(0)).toBe('w-0')
  })

  it('returns w-full for 100%', () => {
    expect(getPercentageWidthClass(100)).toBe('w-full')
  })

  it('rounds to nearest 5% step class', () => {
    expect(getPercentageWidthClass(52)).toBe('w-[50%]')
    expect(getPercentageWidthClass(48)).toBe('w-[50%]')
    expect(getPercentageWidthClass(73)).toBe('w-[75%]')
    expect(getPercentageWidthClass(24)).toBe('w-[25%]')
  })

  it('handles clamp boundaries', () => {
    expect(getPercentageWidthClass(-10)).toBe('w-0')
    expect(getPercentageWidthClass(150)).toBe('w-full')
    expect(getPercentageWidthClass(null)).toBe('w-0')
    expect(getPercentageWidthClass(undefined)).toBe('w-0')
  })
})
