export type Lang = 'ja' | 'en'

// Deep key type for translation key validation at compile time
export type DeepKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends object
        ? `${K}` | `${K}.${DeepKeys<T[K]>}`
        : K
    }[keyof T & string]
  : never

export type TranslationVars = Record<string, string | number>
