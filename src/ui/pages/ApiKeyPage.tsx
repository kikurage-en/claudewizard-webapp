import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { saveApiKey } from '../../security/sessionStore'
import { trackEvent } from '../../analytics/events'
import { MascotCorner } from '../components/MascotCorner'
import type { Lang } from '../../i18n/types'
import type { Plan } from '../../wizard/types'

type Props = {
  lang: Lang
  plan: Plan
  onContinue: () => void
  onCancel: () => void
}

export function ApiKeyPage({ plan, onContinue, onCancel }: Props) {
  const { t } = useTranslation()
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const isValid = apiKey.trim().startsWith('sk-ant-')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    saveApiKey(apiKey.trim())
    trackEvent('api_key_input', { plan })
    onContinue()
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <MascotCorner size={64} />
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border border-orange text-orange bg-cream-peach">
            BYOK
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border border-line-faint text-ink-muted bg-cream">
            {t('api_key.badge_browser')}
          </span>
        </div>

        <h1 className="font-display font-black text-3xl text-ink mb-2">
          {t('api_key.title')}
        </h1>
        <p className="text-ink-muted text-sm mb-8">
          {t('api_key.subtitle')}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-2">
            <label htmlFor="api-key-input" className="sr-only">
              {t('api_key.label')}
            </label>
            <div className="relative">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('api_key.placeholder')}
                autoComplete="off"
                spellCheck={false}
                // モバイルは 16px 必須: font-size < 16px は iOS Safari のフォーカス自動ズームを発火させる
                className="w-full font-mono text-base md:text-sm bg-white border border-line-faint rounded-lg px-4 py-3 pr-20 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                aria-label={t('api_key.label')}
                aria-describedby="api-key-note"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink transition-colors px-1"
                aria-label={showKey ? t('api_key.hide') : t('api_key.show')}
              >
                {showKey ? t('api_key.hide') : t('api_key.show')}
              </button>
            </div>
          </div>

          <p id="api-key-note" className="text-xs text-ink-muted mb-6 leading-relaxed">
            {t('api_key.note')}
          </p>

          <ul className="space-y-2 mb-8">
            {(['check1', 'check2', 'check3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2 text-xs text-ink-muted">
                <span className="text-orange font-bold mt-0.5" aria-hidden="true">✓</span>
                <span>{t(`api_key.${key}`)}</span>
              </li>
            ))}
          </ul>

          <button
            type="submit"
            disabled={!isValid}
            className={[
              'btn-primary w-full py-3 text-base',
              !isValid ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {t('api_key.cta')}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            ← {t('common.back')}
          </button>
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange hover:underline"
          >
            {t('api_key.get_key_link')} ↗
          </a>
        </div>
      </div>
    </main>
  )
}
