/**
 * Maps percentage values to pure Tailwind CSS width classes
 * to eliminate all inline styles.
 */
export function getPercentageWidthClass(percentage) {
  const rounded = Math.min(100, Math.max(0, Math.round(Number(percentage || 0) / 5) * 5))
  const classMap = {
    0: 'w-0',
    5: 'w-[5%]',
    10: 'w-[10%]',
    15: 'w-[15%]',
    20: 'w-[20%]',
    25: 'w-[25%]',
    30: 'w-[30%]',
    35: 'w-[35%]',
    40: 'w-[40%]',
    45: 'w-[45%]',
    50: 'w-[50%]',
    55: 'w-[55%]',
    60: 'w-[60%]',
    65: 'w-[65%]',
    70: 'w-[70%]',
    75: 'w-[75%]',
    80: 'w-[80%]',
    85: 'w-[85%]',
    90: 'w-[90%]',
    95: 'w-[95%]',
    100: 'w-full',
  }
  return classMap[rounded] || 'w-0'
}
