import { useLanguage } from './context'
import { interpolate, selectPlural } from './interpolate'
import type { TranslationVars, Lang } from './types'
import jaRaw from '@/locales/ja.json'
import enRaw from '@/locales/en.json'

const translations: Record<Lang, Record<string, unknown>> = {
  ja: jaRaw as Record<string, unknown>,
  en: enRaw as Record<string, unknown>,
}

function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[part]
  }
  return typeof current === 'string' ? current : undefined
}

export function useTranslation() {
  const { lang } = useLanguage()

  const t = (key: string, vars?: TranslationVars): string => {
    const langData = translations[lang]
    let value = getNestedValue(langData, key)

    // Fall back to Japanese
    if (value === undefined && lang !== 'ja') {
      value = getNestedValue(translations.ja, key)
    }

    if (value === undefined) return key

    // Handle plural forms when count is provided
    if (vars?.count !== undefined) {
      const count = Number(vars.count)
      const baseKey = key.split('.').pop() ?? key
      const siblings = getParentObject(langData, key)
      if (siblings) {
        value = selectPlural(siblings, baseKey, count, lang)
      }
    }

    return interpolate(value, vars)
  }

  return { t, lang }
}

function getParentObject(
  obj: Record<string, unknown>,
  key: string
): Record<string, string> | undefined {
  const parts = key.split('.')
  if (parts.length < 2) return undefined
  const parentParts = parts.slice(0, -1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj
  for (const part of parentParts) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[part]
  }
  if (typeof current === 'object' && current !== null) {
    return current as Record<string, string>
  }
  return undefined
}
