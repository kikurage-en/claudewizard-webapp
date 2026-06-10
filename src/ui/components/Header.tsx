import { useState } from 'react'
import { Mascot } from './Mascot'
import { useTranslation } from '../../i18n/useTranslation'
import { GITHUB_REPO_URL } from '../links'
import type { Lang } from '../../i18n/types'

type Props = {
  lang: Lang
  onLanguageChange: (lang: Lang) => void
}

export function Header({ lang, onLanguageChange }: Props) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const otherLang: Lang = lang === 'ja' ? 'en' : 'ja'

  return (
    <header className="sticky top-0 z-50 h-14 md:h-16 bg-cream border-b border-line-faint flex items-center px-6">
      <a href={`#/${lang}`} className="flex items-center gap-2 font-display font-bold text-ink text-lg">
        <Mascot size="sm" />
        <span>ClaudeWizard</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted border border-line-faint rounded px-1 py-0.5 ml-1">βeta</span>
      </a>

      <nav className="ml-auto hidden md:flex items-center gap-6" aria-label={t('nav.aria_main')}>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-ink-muted hover:text-ink transition-colors">{t('nav.github')} ↗</a>
        <button
          type="button"
          onClick={() => onLanguageChange(otherLang)}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
          aria-label={t('nav.language_switch')}
        >
          {t('nav.language')}
        </button>
        <a href={`#/${lang}`} className="btn-primary text-sm px-4 py-2">{t('nav.start')}</a>
      </nav>

      <button
        type="button"
        className="ml-auto md:hidden text-ink p-2"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={t('nav.menu')}
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="absolute top-14 md:top-16 left-0 right-0 bg-cream border-b border-line-faint p-4 flex flex-col gap-3 md:hidden">
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-ink-muted" onClick={() => setMenuOpen(false)}>{t('nav.github')} ↗</a>
          <button type="button" onClick={() => { onLanguageChange(otherLang); setMenuOpen(false) }} className="text-sm text-ink-muted text-left" aria-label={t('nav.language_switch')}>{t('nav.language')}</button>
          <a href={`#/${lang}`} className="btn-primary text-sm text-center py-2" onClick={() => setMenuOpen(false)}>{t('nav.start')}</a>
        </div>
      )}
    </header>
  )
}
