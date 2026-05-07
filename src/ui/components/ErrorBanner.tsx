import { useTranslation } from '../../i18n/useTranslation'
import type { DeepKeys } from '../../i18n/types'
import jaLocale from '../../locales/ja.json'

export type ErrorCode =
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'timeout'
  | 'cors'
  | 'content_safety'
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
}

type LocaleKey = DeepKeys<typeof jaLocale>

const MESSAGE_KEY: Record<ErrorCode, LocaleKey> = {
  auth: 'errors.api.invalid_key',
  rate_limit: 'errors.api.rate_limit',
  server: 'errors.api.server_error',
  timeout: 'errors.api.timeout',
  cors: 'errors.api.cors',
  content_safety: 'errors.api.content_safety',
  unknown: 'errors.generation.failed',
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

  const colorClasses =
    category === 'fatal'
      ? 'bg-red-50 border-red-500 text-red-900'
      : category === 'auto_recovery'
        ? 'bg-yellow-50 border-yellow-500 text-yellow-900'
        : 'bg-orange-50 border-orange-500 text-orange-900'

  return (
    <div
      role="alert"
      className={`border-l-4 p-4 rounded ${colorClasses}`}
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
