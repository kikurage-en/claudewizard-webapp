import { useTranslation } from '../../i18n/useTranslation'
import type { Plan } from '../../wizard/types'

type Props = {
  plan: Plan
  onSelect: (plan: Plan) => void
  disabled?: boolean
}

export function PlanCard({ plan, onSelect, disabled = false }: Props) {
  const { t } = useTranslation()

  const isPlus = plan === 'plus'
  const isComingSoon = plan === 'plus'

  const handleClick = () => {
    if (!disabled && !isComingSoon) onSelect(plan)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isComingSoon) {
      e.preventDefault()
      onSelect(plan)
    }
  }

  return (
    <div
      className={[
        'card relative flex flex-col p-6',
        isPlus ? 'bg-dark-card text-dark-card-surface border-ink' : 'bg-white border-line-faint',
        isPlus ? 'shadow-[5px_5px_0_#D97757]' : '',
        isComingSoon ? 'opacity-60' : 'cursor-pointer hover:border-line-strong',
      ].join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isComingSoon ? -1 : 0}
      role="button"
      aria-disabled={isComingSoon || disabled}
    >
      {isPlus && (
        <span className="absolute -top-3 right-4 bg-orange text-white text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-1 rounded-full">
          {t('plans.plus.recommended')}
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-2xl">{t(`plans.${plan}.name`)}</h3>
          <p className={`text-xs mt-1 ${isPlus ? 'text-ink-faint' : 'text-ink-muted'}`}>{t(`plans.${plan}.tagline`)}</p>
        </div>
        <span className={[
          'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded border',
          plan === 'free'
            ? 'border-line-faint text-ink-muted bg-cream'
            : 'border-orange text-orange bg-cream-peach',
        ].join(' ')}>
          {t(`plans.${plan}.badge_api`)}
        </span>
      </div>

      <p className={`text-sm mb-4 flex-1 ${isPlus ? 'text-ink-faint' : 'text-ink-muted'}`}>
        {t(`plans.${plan}.description`)}
      </p>

      <div className={`border-t pt-4 mb-4 ${isPlus ? 'border-dark-card-divider' : 'border-line-faint'}`}>
        <p className="text-2xl font-mono font-bold">{t(`plans.${plan}.price`)}</p>
        <p className={`text-[10px] font-mono uppercase tracking-wider ${isPlus ? 'text-ink-faint' : 'text-ink-muted'}`}>
          {t(`plans.${plan}.price_note`)}
        </p>
      </div>

      <div className={`border-t pt-4 mb-4 ${isPlus ? 'border-dark-card-divider' : 'border-line-faint'}`}>
        <p className={`text-xs mb-1 ${isPlus ? 'text-ink-faint' : 'text-ink-muted'}`}>{t('plans.target_label')}</p>
        <p className="text-sm font-medium">{t(`plans.${plan}.target`)}</p>
      </div>

      <div className={`border-t pt-4 mb-6 ${isPlus ? 'border-dark-card-divider' : 'border-line-faint'}`}>
        <p className={`text-xs mb-1 ${isPlus ? 'text-ink-faint' : 'text-ink-muted'}`}>{t('plans.files_label')}</p>
        <p className="text-sm font-mono font-bold text-orange">{t(`plans.${plan}.files_count`)}</p>
      </div>

      {isComingSoon ? (
        <div className="btn-secondary text-center text-sm py-2 opacity-60 cursor-not-allowed">
          {t(`plans.${plan}.coming_soon`)}
        </div>
      ) : (
        <button
          className={isPlus ? 'w-full bg-orange text-white font-bold py-2 rounded-lg hover:bg-orange-dark transition-colors' : 'btn-primary w-full py-2'}
          onClick={(e) => { e.stopPropagation(); onSelect(plan) }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {t(`plans.${plan}.cta`)}
        </button>
      )}
    </div>
  )
}
