declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function gtag(...args: unknown[]): void {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(args)
    window.gtag?.(...args)
  }
}

export function isGa4Enabled(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}
