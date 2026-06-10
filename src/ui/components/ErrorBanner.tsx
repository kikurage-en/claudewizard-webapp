import { useTranslation } from '../../i18n/useTranslation'
import type { DeepKeys } from '../../i18n/types'
import jaLocale from '../../locales/ja.json'
import { AnthropicClientError } from '../../security/anthropicClient'
import { MissingApiKeyError, NotImplementedError } from '../../generator/generate'

export type ErrorCode =
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'timeout'
  | 'cors'
  | 'content_safety'
  | 'unavailable'
  | 'unknown'

type ErrorCategory = 'auto_recovery' | 'user_action' | 'fatal'

// 要件定義書 §20.2 のエラー分類マッピング
const CATEGORY_MAP: Record<ErrorCode, ErrorCategory> = {
  rate_limit: 'auto_recovery',
  server: 'auto_recovery',
  auth: 'user_action',
  timeout: 'user_action',
  content_safety: 'user_action',
  unknown: 'user_action',
  cors: 'fatal',
  // Plus 未配線（NotImplementedError）。再試行しても必ず失敗するため fatal（retry ボタンを出さない）。
  unavailable: 'fatal',
}

type LocaleKey = DeepKeys<typeof jaLocale>

const MESSAGE_KEY: Record<ErrorCode, LocaleKey> = {
  auth: 'errors.api.invalid_key',
  rate_limit: 'errors.api.rate_limit',
  server: 'errors.api.server_error',
  timeout: 'errors.api.timeout',
  cors: 'errors.api.cors',
  content_safety: 'errors.api.content_safety',
  unavailable: 'errors.generation.unavailable',
  unknown: 'errors.generation.failed',
}

// 生成時の例外を ErrorCode に分類する（WizardPage / CompletePage 共通。ErrorCode と密接なため本ファイルに集約）。
export function mapErrorToCode(err: unknown): ErrorCode {
  if (err instanceof AnthropicClientError) return err.code as ErrorCode
  if (err instanceof MissingApiKeyError) return 'auth'
  if (err instanceof NotImplementedError) return 'unavailable'
  return 'unknown'
}

type Props = {
  code: ErrorCode
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorBanner({ code, onRetry, onDismiss }: Props) {
  const { t } = useTranslation()
  const category = CATEGORY_MAP[code]
  const message = t(MESSAGE_KEY[code])

  // 配色はデザイン正 wf-static-errors.jsx の暖色系（fatal=danger / auto_recovery=danger-soft / user_action=orange）
  const colorClasses =
    category === 'fatal'
      ? 'bg-white border-danger'
      : category === 'auto_recovery'
        ? 'bg-cream border-danger-soft'
        : 'bg-cream-peach border-orange'

  return (
    <div
      role="alert"
      className={`border-2 border-l-8 p-4 rounded-card-sm text-ink ${colorClasses}`}
      data-testid="error-banner"
      data-category={category}
      data-code={code}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-sm flex-1">{message}</p>
        <div className="flex gap-3 items-center shrink-0">
          {category !== 'fatal' && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-bold underline hover:no-underline"
            >
              {t('common.retry')}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t('common.close')}
              className="text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
