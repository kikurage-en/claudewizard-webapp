import type { TranslationVars } from './types'

/**
 * Interpolates {{key}} placeholders in a template string.
 * Handles _one / _other plural forms for English (when count is provided).
 */
export function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key]
    return val !== undefined ? String(val) : `{{${key}}}`
  })
}

/**
 * Selects the appropriate plural form based on count.
 * English: _one (count === 1), _other (otherwise)
 * Japanese: no plural distinction
 */
export function selectPlural(
  translations: Record<string, string>,
  key: string,
  count: number,
  lang: string
): string {
  if (lang === 'en') {
    const oneKey = `${key}_one`
    const otherKey = `${key}_other`
    if (count === 1 && oneKey in translations) return translations[oneKey]
    if (otherKey in translations) return translations[otherKey]
  }
  return translations[key] ?? key
}
