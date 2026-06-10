import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  onDownload: () => void
  disabled?: boolean
  loading?: boolean
  /** ラベル差し替え（生成済み時の「再ダウンロード」等）。未指定時は result.download_label */
  label?: string
}

export function DownloadButton({ onDownload, disabled = false, loading = false, label }: Props) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      title={disabled ? t('result.download_disabled') : undefined}
      className={[
        'w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2',
        disabled || loading
          ? 'bg-line-faint text-ink-muted cursor-not-allowed'
          : 'bg-orange text-white hover:bg-orange-hover hover:-translate-y-px motion-reduce:hover:translate-y-0 active:scale-[0.98]',
      ].join(' ')}
    >
      {loading ? t('common.loading') : (label ?? t('result.download_label'))}
    </button>
  )
}
