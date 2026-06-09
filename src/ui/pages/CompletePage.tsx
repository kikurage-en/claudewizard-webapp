import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Mascot } from '../components/Mascot'
import { DownloadButton } from '../components/DownloadButton'
import { ConsentCheckbox } from '../components/ConsentCheckbox'
import { ErrorBanner, mapErrorToCode, type ErrorCode } from '../components/ErrorBanner'
import type { Lang } from '../../i18n/types'
import { generate } from '../../generator/generate'
import { downloadBlob } from '../../generator/zipBuilder'
import { trackEvent } from '../../analytics/events'
import { getManifest } from '../../templates/manifest'

type Props = {
  lang: Lang
  plan: 'free' | 'light' | 'plus'
  answers: Record<string, string>
  onTryAgain: () => void
}

export function CompletePage({ lang, plan, answers, onTryAgain }: Props) {
  const { t } = useTranslation()
  const [consented, setConsented] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const manifest = getManifest(plan)

  const handleDownload = async () => {
    if (!consented || loading) return
    setLoading(true)
    setErrorCode(null) // 試行開始時にクリア（リトライ成功で古いバナーが残らない）
    try {
      const blob = await generate(plan, lang, answers)
      downloadBlob(blob, t('result.zip_filename'))
      trackEvent('zip_download', { plan })
    } catch (err) {
      // code 別に分類して表示・計測（WizardPage から移設。analytics の粒度を保つ）
      const code = mapErrorToCode(err)
      setErrorCode(code)
      trackEvent('error_occurred', { error_type: code })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <Mascot size="lg" className="mb-6" />

        <span className="inline-block font-mono text-xs font-bold tracking-widest uppercase bg-orange text-white px-3 py-1 rounded-full mb-4">
          {t('result.done_badge')}
        </span>

        <h1 className="font-display font-black text-4xl text-ink mb-3">{t('result.title')}</h1>
        <p className="text-ink-muted mb-8">{t('result.subtitle')}</p>
        <p className="text-sm text-ink-muted mb-8">{t('result.description')}</p>

        {errorCode && (
          <div className="mb-6 text-left">
            <ErrorBanner
              code={errorCode}
              onRetry={handleDownload}
              onDismiss={() => setErrorCode(null)}
            />
          </div>
        )}

        <div className="card bg-white p-6 mb-6 text-left">
          <h2 className="font-bold text-sm text-ink mb-4">{t('result.files_title')}</h2>
          <ul className="space-y-2">
            {manifest.map((entry) => (
              <li key={entry.zipPath} className="flex items-center gap-2">
                <span className="text-orange text-xs">◆</span>
                <code className="text-xs font-mono text-ink-muted border border-dashed border-line-faint px-2 py-0.5 rounded">
                  {entry.zipPath}
                </code>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <ConsentCheckbox checked={consented} onChange={setConsented} lang={lang} />
        </div>

        <DownloadButton onDownload={handleDownload} disabled={!consented} loading={loading} />

        <button
          type="button"
          onClick={onTryAgain}
          className="mt-4 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          {t('result.try_again')}
        </button>
      </div>
    </main>
  )
}
