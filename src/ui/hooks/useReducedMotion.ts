import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// CSS のグローバル対応（index.css）では JS 駆動アニメーション（rAF / setTimeout）は
// 止まらないため、JS 側でも reduced-motion を監視する。
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(QUERY)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
