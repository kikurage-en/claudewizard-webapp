import { Mascot } from '../components/Mascot'
import { useTranslation } from '../../i18n/useTranslation'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <Mascot size="lg" className="mb-6 opacity-50" />
      <h1 className="font-display font-black text-4xl text-ink mb-4">404</h1>
      <p className="text-ink-muted mb-8">{t('errors.not_found.message')}</p>
      <a href="#/" className="btn-primary px-6 py-2">
        {t('errors.not_found.back_home')}
      </a>
    </main>
  )
}
