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
  const inactive = disabled || isComingSoon

  return (
    // カード全体をネイティブ button にしてキーボード標準挙動（Enter/Space）を得る。
    // 内側の CTA はネスト button を避けるため装飾 span。
    <button
      type="button"
      className={[
        'relative flex flex-col p-6 rounded-[18px] text-left w-full border transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2',
        isPlus ? 'bg-dark-card text-dark-card-surface border-ink' : 'bg-white border-line-faint',
        isPlus ? 'shadow-offset-orange-lg' : '',
        inactive ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-line-strong',
      ].join(' ')}
      onClick={() => {
        if (!inactive) onSelect(plan)
      }}
      disabled={inactive}
      aria-disabled={inactive}
    >
      {isPlus && (
        <span className="absolute -top-3 right-5 bg-orange text-white text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-1 rounded-full">
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
        <p className="text-[28px] leading-tight font-mono font-black tracking-tight">{t(`plans.${plan}.price`)}</p>
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
        <span className="btn-secondary block text-center text-sm py-2 opacity-60 cursor-not-allowed">
          {t(`plans.${plan}.coming_soon`)}
        </span>
      ) : (
        <span
          className={
            isPlus
              ? 'block text-center w-full bg-orange text-white font-bold py-2 rounded-btn hover:bg-orange-hover transition-colors'
              : 'btn-primary block text-center w-full py-2'
          }
        >
          {t(`plans.${plan}.cta`)}
        </span>
      )}
    </button>
  )
}
