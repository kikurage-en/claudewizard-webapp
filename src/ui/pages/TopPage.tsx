import { Fragment } from 'react'
import { PixelDolphin } from '../components/PixelDolphin'
import { MascotCorner } from '../components/MascotCorner'
import { PlanCard } from '../components/PlanCard'
import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'
import type { Plan } from '../../wizard/types'

type Props = {
  lang: Lang
  onSelectPlan: (plan: Plan) => void
}

// 生成物スタンプ（ファイル名は翻訳対象外のリテラル）。rot はデザイン正の散らし角度
const FILE_STAMPS = [
  { label: 'CLAUDE.md', rot: -6 },
  { label: 'rules/*.md', rot: 4 },
  { label: 'hooks/', rot: -5 },
  { label: 'SKILL.md', rot: 6 },
  { label: '.claude/', rot: -3 },
] as const

export function TopPage({ lang, onSelectPlan }: Props) {
  const { t } = useTranslation()

  // H1 内の強調語（マーカー下線）だけを span 化する（ConsentCheckbox と同じ部分一致方式）
  const title = t('hero.title')
  const highlight = t('hero.title_highlight')
  const hIdx = title.indexOf(highlight)
  const titleBefore = hIdx >= 0 ? title.slice(0, hIdx) : title
  const titleAfter = hIdx >= 0 ? title.slice(hIdx + highlight.length) : ''

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      {/* ドット背景テクスチャ（装飾オーバーレイ） */}
      <div aria-hidden="true" className="absolute inset-0 bg-dot-texture opacity-60 pointer-events-none" />

      <section className="relative max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-ink rounded-full pl-2.5 pr-3.5 py-1.5 font-mono text-xs font-medium text-ink mb-7">
          <PixelDolphin size={20} />
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="font-display font-black text-4xl md:text-7xl text-ink leading-[1.15] tracking-tight whitespace-pre-line mb-6">
          {titleBefore}
          {hIdx >= 0 && (
            <span
              data-testid="hero-highlight"
              className="text-orange italic pr-2"
              style={{ background: 'linear-gradient(transparent 64%, rgba(217, 119, 87, 0.19) 64%)' }}
            >
              {highlight}
            </span>
          )}
          {titleAfter}
        </h1>

        <p className="text-ink-muted text-base md:text-[17px] leading-loose max-w-xl mx-auto whitespace-pre-line mb-9">
          {t('hero.subtitle')}
        </p>

        <a
          href={`#/${lang}/wizard`}
          className="inline-block bg-ink text-cream font-bold text-base px-10 py-4 rounded-full shadow-offset-orange
                     hover:bg-line-strong hover:-translate-y-px transition-all duration-200
                     motion-reduce:transition-none motion-reduce:hover:translate-y-0
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        >
          {t('hero.cta_primary')}
        </a>

        <p className="font-mono text-[11px] text-ink-muted mt-4">{t('hero.meta')}</p>

        {/* 3 ステップ破線チップ */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {(['step1', 'step2', 'step3'] as const).map((key, i) => (
            <Fragment key={key}>
              <span
                data-testid="step-chip"
                className="inline-flex items-center gap-2 px-3 py-1.5 border-[1.5px] border-dashed border-orange-deep rounded-full bg-white"
              >
                <span className="font-mono text-[11px] font-extrabold text-orange-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[13px] font-semibold text-ink">{t(`hero.${key}`)}</span>
              </span>
              {i < 2 && (
                <span aria-hidden="true" className="font-mono text-[13px] text-ink-muted">
                  →
                </span>
              )}
            </Fragment>
          ))}
        </div>

        <div className="mt-3">
          <a href="#how" className="text-[13px] text-ink-muted underline underline-offset-4 hover:text-ink transition-colors">
            {t('hero.cta_secondary')}
          </a>
        </div>

        {/* コーナーマスコット（ヒーロー右下のアクセント） */}
        <MascotCorner text={t('hero.mascot_bubble')} size={80} />
      </section>

      {/* 生成物のファイルスタンプ */}
      <div className="relative flex flex-wrap items-center justify-center gap-3.5 max-w-3xl mx-auto px-6 pb-16">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-ink-muted -rotate-2">
          {t('hero.generates')}
        </span>
        {FILE_STAMPS.map((s, i) => (
          <span
            key={s.label}
            data-testid="file-stamp"
            className="font-mono text-xs font-bold text-orange-deep border-2 border-dashed border-orange-deep
                       outline outline-1 outline-orange-deep outline-offset-2 rounded px-2.5 py-1 opacity-80"
            style={{ transform: `rotate(${s.rot}deg) translateY(${(i % 2) * 4 - 2}px)` }}
          >
            {s.label}
          </span>
        ))}
      </div>

      <section id="how" className="relative max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-display font-bold text-2xl text-ink text-center mb-4">
          {t('plans.select_title')}
        </h2>
        <p className="text-ink-muted text-center mb-10">{t('plans.select_subtitle')}</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <PlanCard plan="free" onSelect={onSelectPlan} />
          <PlanCard plan="light" onSelect={onSelectPlan} />
          <PlanCard plan="plus" onSelect={onSelectPlan} disabled />
        </div>
      </section>
    </main>
  )
}
