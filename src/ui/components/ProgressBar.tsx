import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center gap-3"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={t('wizard.question_of', { current, total })}
    >
      {/* セグメント分割バー（final-variants.jsx: 完了=orange / 未完=dark-card-divider） */}
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            data-testid="progress-segment"
            data-state={i < current ? 'done' : 'todo'}
            className={[
              'flex-1 h-1 rounded-sm transition-colors duration-300 ease-out motion-reduce:transition-none',
              i < current ? 'bg-orange' : 'bg-dark-card-divider',
            ].join(' ')}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-ink-faint whitespace-nowrap">
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  )
}
