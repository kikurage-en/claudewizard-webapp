import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'

type Props = {
  lang: Lang
}

export function Footer({ lang }: Props) {
  const { t } = useTranslation()

  return (
    <footer className="bg-ink text-dark-card-surface py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 justify-between">
        <div>
          <p className="font-display font-bold text-lg mb-2">ClaudeWizard</p>
          <p className="text-sm text-ink-faint max-w-xs">Claude Code 設定ファイル生成ウィザード</p>
        </div>
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <a href={`#/${lang}/terms`} className="text-ink-faint hover:text-dark-card-surface transition-colors">{t('legal.footer_terms')}</a>
            <a href={`#/${lang}/privacy`} className="text-ink-faint hover:text-dark-card-surface transition-colors">{t('legal.footer_privacy')}</a>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-dark-card-surface transition-colors">{t('nav.github')} ↗</a>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-dark-card-divider">
        <p className="text-xs text-ink-faint font-mono">{t('legal.copyright')}</p>
      </div>
    </footer>
  )
}
