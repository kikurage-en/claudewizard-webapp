import { gtag } from './ga4'

type EventParams = Record<string, string | number | boolean>

export function trackEvent(eventName: string, params?: EventParams): void {
  gtag('event', eventName, params ?? {})
}

export function trackPageView(path: string, lang: string): void {
  trackEvent('page_view', { page_path: path, language: lang })
}

export function trackPlanSelect(plan: string): void {
  trackEvent('plan_select', { plan })
}

export function trackLanguageSwitch(from: string, to: string): void {
  trackEvent('language_switch', { from_lang: from, to_lang: to })
}

export function trackErrorOccurred(errorType: string): void {
  trackEvent('error_occurred', { error_type: errorType })
}

// Phase 2+ type stubs
export type ApiKeyInputParams = { plan: string }
export type LicenseKeyInputParams = { plan: string }
