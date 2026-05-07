import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'

type Props = { lang: Lang }

export function PrivacyPage({ lang: _lang }: Props) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display font-black text-3xl text-ink mb-8">{t('legal.privacy.title')}</h1>
        <div className="prose prose-sm text-ink-muted whitespace-pre-wrap leading-relaxed">
          {t('legal.privacy.body')}
        </div>
      </div>
    </main>
  )
}
