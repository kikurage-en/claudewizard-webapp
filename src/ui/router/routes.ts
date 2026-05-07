import type { Lang } from '../../i18n/types'

export type Route =
  | { name: 'top'; lang: Lang }
  | { name: 'api-key'; lang: Lang }
  | { name: 'wizard'; lang: Lang }
  | { name: 'complete'; lang: Lang }
  | { name: 'terms'; lang: Lang }
  | { name: 'privacy'; lang: Lang }
  | { name: 'not-found' }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'

  const jaMatch = path.match(/^\/(ja)(\/(.*))?$/)
  const enMatch = path.match(/^\/(en)(\/(.*))?$/)

  const match = jaMatch ?? enMatch
  if (!match) return { name: 'not-found' }

  const lang = match[1] as Lang
  const sub = match[3] ?? ''

  if (!sub || sub === '') return { name: 'top', lang }
  if (sub === 'api-key') return { name: 'api-key', lang }
  if (sub === 'wizard') return { name: 'wizard', lang }
  if (sub === 'complete') return { name: 'complete', lang }
  if (sub === 'terms') return { name: 'terms', lang }
  if (sub === 'privacy') return { name: 'privacy', lang }

  return { name: 'not-found' }
}

export function buildHash(_name: string, lang: Lang, sub?: string): string {
  if (sub) return `#/${lang}/${sub}`
  return `#/${lang}`
}

export function navigate(path: string): void {
  window.location.hash = path.startsWith('#') ? path.slice(1) : path
}
