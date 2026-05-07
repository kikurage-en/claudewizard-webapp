import { createContext, useContext, type ReactNode } from 'react'
import type { Lang } from './types'

type LanguageContextValue = {
  lang: Lang
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

type Props = {
  lang: Lang
  children: ReactNode
}

export function LanguageProvider({ lang, children }: Props) {
  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
