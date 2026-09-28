import React from 'react'

// Shared inline SVG icon set — restrained line icons, no emoji/unicode glyphs.
// All icons default to 24x24 viewBox, inherit color via currentColor, and accept className.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconCheck = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const IconClose = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const IconChevronRight = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const IconArrowLeft = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

export const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export const IconMail = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const IconUsers = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

export const IconBolt = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
  </svg>
)

export const IconBarChart = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M3 21h18" />
    <rect x="6" y="11" width="3" height="7" />
    <rect x="11" y="7" width="3" height="11" />
    <rect x="16" y="14" width="3" height="4" />
  </svg>
)

export const IconPalette = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 1.8-4.2 1.5 1.5 0 0 1 1.1-2.5H17a3 3 0 0 0 3-3c0-5.5-3.6-10.3-8-10.3Z" />
    <circle cx="7" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBulb = ({ className = 'w-4 h-4' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M9 18h6M10 22h4" />
    <path d="M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.3v.2h6v-.2c0-.9.4-1.7 1-2.3A6 6 0 0 0 12 2Z" />
  </svg>
)

export const IconLock = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export const IconLogOut = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
)

export const IconFlag = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M5 21V4" />
    <path d="M5 4h13l-3 4.5L18 13H5" />
  </svg>
)

export const IconCheckCircle = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
)

export const IconClock = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const IconHelpCircle = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 1.8-2.3 3.5" />
    <path d="M12 17h.01" strokeWidth={2.5} />
  </svg>
)

export const IconLoader = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
)
