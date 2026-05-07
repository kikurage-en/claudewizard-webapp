import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  onDownload: () => void
  disabled?: boolean
  loading?: boolean
}

export function DownloadButton({ onDownload, disabled = false, loading = false }: Props) {
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
          : 'bg-orange text-white hover:bg-orange-dark active:scale-[0.98]',
      ].join(' ')}
    >
      {loading ? t('common.loading') : t('result.download_label')}
    </button>
  )
}
