import { Mascot } from '../components/Mascot'
import { PlanCard } from '../components/PlanCard'
import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'
import type { Plan } from '../../wizard/types'

type Props = {
  lang: Lang
  onSelectPlan: (plan: Plan) => void
}

export function TopPage({ lang, onSelectPlan }: Props) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-cream">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="flex justify-end mb-4">
          <Mascot size="md" />
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl text-ink leading-tight whitespace-pre-line mb-6">
          {t('hero.title')}
        </h1>
        <p className="text-ink-muted text-lg max-w-xl mx-auto mb-10">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`#/${lang}/wizard`}
            className="btn-primary text-base px-8 py-3"
          >
            {t('hero.cta_primary')}
          </a>
          <a
            href="#how"
            className="btn-secondary text-base px-8 py-3"
          >
            {t('hero.cta_secondary')}
          </a>
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-display font-bold text-2xl text-ink text-center mb-4">
          {t('plans.select_title')}
        </h2>
        <p className="text-ink-muted text-center mb-10">{t('plans.select_subtitle')}</p>
        <div className="grid md:grid-cols-3 gap-6">
          <PlanCard plan="free" onSelect={onSelectPlan} />
          <PlanCard plan="light" onSelect={onSelectPlan} />
          <PlanCard plan="plus" onSelect={onSelectPlan} disabled />
        </div>
      </section>
    </main>
  )
}
