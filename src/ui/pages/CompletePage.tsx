import { useEffect, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Mascot } from '../components/Mascot'
import { PixelDolphin } from '../components/PixelDolphin'
import { MascotCorner } from '../components/MascotCorner'
import { DownloadButton } from '../components/DownloadButton'
import { ConsentCheckbox } from '../components/ConsentCheckbox'
import { ErrorBanner, mapErrorToCode, type ErrorCode } from '../components/ErrorBanner'
import type { Lang } from '../../i18n/types'
import { generate } from '../../generator/generate'
import { downloadBlob } from '../../generator/zipBuilder'
import { trackEvent } from '../../analytics/events'
import { getManifest } from '../../templates/manifest'
import { getQuestions } from '../../wizard/questions'

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
  // 生成済み ZIP の保持（要件 §4.4 #2「結果をブラウザ内に保持」）。
  // 再ダウンロードは再生成しない＝Light の Claude API 再課金を防ぐ。失敗時は保持しない。
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null)
  const generated = generatedBlob !== null
  const manifest = getManifest(plan)
  const questionCount = getQuestions(plan).length
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  // 言語・プラン変更時はキャッシュを破棄（生成物言語は UI 言語連動のため）
  useEffect(() => {
    setGeneratedBlob(null)
  }, [lang, plan])

  const handleDownload = async () => {
    if (!consented || loading) return
    // 生成済みなら再ダウンロードのみ（zip_download はダウンロード数として毎回計測）
    if (generatedBlob) {
      downloadBlob(generatedBlob, t('result.zip_filename'))
      trackEvent('zip_download', { plan })
      return
    }
    setLoading(true)
    setErrorCode(null) // 試行開始時にクリア（リトライ成功で古いバナーが残らない）
    try {
      const blob = await generate(plan, lang, answers)
      setGeneratedBlob(blob)
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

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#/${lang}/`
    navigator.share({ title: 'ClaudeWizard', url }).catch(() => {
      // ユーザーキャンセル等は無視（エラー表示しない）
    })
  }

  return (
    <main className="relative min-h-screen bg-cream flex flex-col items-center px-6 py-12 md:py-16">
      <MascotCorner text={t('result.mascot_bubble')} size={88} />
      <div className="max-w-lg w-full text-center">
        {/* 全問完了の視覚化ドット */}
        <div className="flex items-center justify-center gap-1.5 mb-6" aria-hidden="true">
          {Array.from({ length: questionCount }, (_, i) => (
            <span key={i} data-testid="complete-dot" className="w-[7px] h-[7px] rounded-full bg-orange" />
          ))}
        </div>

        <Mascot size="lg" className="mb-6" />

        <span
          data-testid="done-badge"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase
                     bg-orange text-white border-[1.5px] border-ink shadow-offset-ink-sm
                     px-3 py-1.5 rounded-full mb-5 -rotate-2"
        >
          <PixelDolphin size={18} />
          {generated ? t('result.done_badge') : t('result.ready_badge')}
        </span>

        <h1 className="font-display font-black text-5xl md:text-6xl text-ink tracking-tight mb-4">
          <span style={{ background: 'linear-gradient(transparent 62%, rgba(217, 119, 87, 0.33) 62%)' }}>
            {generated ? t('result.title') : t('result.ready_title')}
          </span>
        </h1>
        <p className="text-ink-muted mb-2">
          {generated ? t('result.subtitle') : t('result.ready_subtitle')}
        </p>
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

        {/* 生成ファイルカード（border 2px ink + 厚いオフセット影） */}
        <div className="bg-white border-2 border-ink rounded-[16px] shadow-offset-ink p-5 mb-8 text-left">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3">
            {generated
              ? t('result.files_caption', { count: manifest.length })
              : t('result.files_caption_pending', { count: manifest.length })}
          </p>
          <ul>
            {manifest.map((entry, i) => (
              <li
                key={entry.zipPath}
                data-testid="file-item"
                className={[
                  'flex items-center gap-3 py-2',
                  i < manifest.length - 1 ? 'border-b border-dashed border-line-faint' : '',
                ].join(' ')}
              >
                {/* 生成前は中立ドット、生成成功後に ✓（文言と実態の整合） */}
                {generated ? (
                  <span className="text-orange font-black text-base" aria-hidden="true">✓</span>
                ) : (
                  <span className="text-ink-muted font-black text-base" aria-hidden="true">·</span>
                )}
                <span className="font-mono text-[13px] font-bold text-ink">{entry.zipPath}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* エラーバナー表示中は下フォームを無効化（半透明 + pointer-events:none、FR-11） */}
        <div
          data-testid="complete-form"
          className={errorCode ? 'opacity-50 pointer-events-none select-none' : ''}
        >
          <div className="mb-4 text-left inline-block">
            <ConsentCheckbox checked={consented} onChange={setConsented} lang={lang} />
          </div>

          <DownloadButton
            onDownload={handleDownload}
            disabled={!consented}
            loading={loading}
            label={generated ? t('result.download_again_label') : undefined}
          />

          {/* Light は BYOK 課金の透明性を明示（生成は 1 回のみ・再 DL は無課金） */}
          {plan === 'light' && (
            <p className="mt-3 text-xs text-ink-muted">{t('result.light_billing_note')}</p>
          )}

          <div className="mt-4 flex gap-3 justify-center">
            <button
              type="button"
              onClick={onTryAgain}
              className="flex-1 bg-white text-ink border-[1.5px] border-ink rounded-btn font-bold text-sm py-2.5
                         hover:bg-cream hover:-translate-y-px transition-all duration-200
                         motion-reduce:transition-none motion-reduce:hover:translate-y-0
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            >
              {t('result.back_to_top')}
            </button>
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 bg-white text-ink border-[1.5px] border-ink rounded-btn font-bold text-sm py-2.5
                           hover:bg-cream transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
              >
                {t('result.share_label')}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
