import React from 'react'
import { avatarUrl } from '../../lib/avatars'

export default function Avatar({ id, className = 'w-10 h-10', alt = '' }) {
  return (
    <img
      src={avatarUrl(id)}
      alt={alt}
      draggable={false}
      className={`${className} rounded-full object-cover bg-brand-orange-light shrink-0`}
    />
  )
}
