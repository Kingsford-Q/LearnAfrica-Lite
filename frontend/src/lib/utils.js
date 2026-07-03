import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Formats a real count for display in marketing-style stat tiles (e.g. "1.2K+",
// "300+", "42") without ever inflating the number — a small, honest platform
// should read as small, not fake it with a rounded-up "50K+".
export function formatStatCount(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0'
  if (n >= 1000) return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, '')}K+`
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`
  return `${n}`
}
