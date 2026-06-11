import { useEffect, useCallback } from 'react'
import { useWizard } from '../../wizard/WizardProvider'
import { getQuestions } from '../../wizard/questions'
import { useTranslation } from '../../i18n/useTranslation'
import { ProgressBar } from '../components/ProgressBar'
import { ChoiceCard } from '../components/ChoiceCard'
import { TextInput } from '../components/TextInput'
import { PixelDolphin } from '../components/PixelDolphin'
import { MascotCorner } from '../components/MascotCorner'
import type { Lang } from '../../i18n/types'
import type { ChoiceQuestion, TextQuestion } from '../../wizard/types'
import { trackEvent } from '../../analytics/events'

// Q1 は 7 択のため H まで確保（不足すると末尾の選択肢にショートカットが割り当たらない）
const SHORTCUTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

type Props = {
  lang: Lang
  onComplete: () => void
  onCancel: () => void
}

export function WizardPage({ onComplete, onCancel }: Props) {
  const { t } = useTranslation()
  const { state, dispatch } = useWizard()
  const questions = getQuestions(state.plan)
  const total = questions.length
  const question = questions[state.currentIndex]
  const currentAnswer = state.answers[question.id] ?? ''

  // 質問が変わったら最上部へ（モバイルで前の質問のスクロール位置を引き継がない）
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [question.id])

  const canProceed = (): boolean => {
    if (question.type === 'text') {
      const q = question as TextQuestion
      if (q.optional) return true
      if (!currentAnswer) return false
      return q.validate ? q.validate(currentAnswer) : currentAnswer.trim().length > 0
    }
    if (!currentAnswer) return false
    return true
  }

  const handleNext = useCallback(() => {
    if (!canProceed()) return

    trackEvent('question_complete', { question_id: question.id, index: state.currentIndex + 1 })

    if (state.currentIndex === total - 1) {
      // 生成・DL は CompletePage で利用規約に同意した後に行う（同意なし自動DL を防ぐ・全プラン共通）。
      dispatch({ type: 'SET_DONE' })
      onComplete()
      return
    }
    dispatch({ type: 'NEXT' })
  }, [canProceed, question.id, state, total, dispatch, onComplete])

  const handleCancel = useCallback(() => {
    dispatch({ type: 'CANCEL' })
    onCancel()
  }, [dispatch, onCancel])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      // IME 変換確定の Enter（日本語入力など）は「次へ」扱いにしない
      if (e.isComposing) return
      if (e.key === 'Enter') {
        handleNext()
        return
      }
      if (e.key === 'Escape') {
        handleCancel()
        return
      }
      if (question.type === 'choice') {
        const q = question as ChoiceQuestion
        const idx = SHORTCUTS.indexOf(e.key.toUpperCase())
        if (idx >= 0 && idx < q.options.length) {
          dispatch({ type: 'SET_ANSWER', questionId: question.id, answer: q.options[idx].value })
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleNext, handleCancel, question, dispatch])

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      <aside
        className="relative bg-ink text-dark-card-surface md:w-[440px] md:shrink-0 p-8 flex flex-col gap-6"
        aria-label={t('wizard.question_of', { current: state.currentIndex + 1, total })}
      >
        {/* ドット背景テクスチャ（ダークパネル用・密） */}
        <div aria-hidden="true" className="absolute inset-0 bg-dot-texture-dense opacity-[0.35] pointer-events-none" />

        <div className="relative flex items-center gap-2">
          <PixelDolphin size={22} />
          <span className="font-mono text-xs font-bold">ClaudeWizard</span>
          <span className="font-mono text-[10px] text-ink-faint">· {state.plan} plan</span>
        </div>

        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-widest mb-1">
            <span className="text-orange">{t('wizard.question_of', { current: state.currentIndex + 1, total })}</span>
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl leading-snug mb-3">
            {t(question.titleKey)}
          </h1>
          <p className="text-ink-faint text-sm leading-relaxed">{t(question.subtitleKey)}</p>
        </div>

        <div className="relative">
          <ProgressBar current={state.currentIndex + 1} total={total} />
        </div>

        {/* ヒントは進捗バー直下（mt-auto で左下に離すと視線が泳ぐため上部に寄せる） */}
        {question.tipKey && (
          <div className="relative bg-line-strong rounded-card-sm p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange mb-1.5">
              {t('wizard.tip_label')}
            </p>
            <p className="text-xs text-ink-faint leading-relaxed">{t(question.tipKey)}</p>
          </div>
        )}
      </aside>

      <main className="relative flex-1 p-6 md:px-12 md:py-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {state.currentIndex > 0 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'BACK' })}
                className="font-mono text-xs text-ink-muted hover:text-ink transition-colors"
              >
                ← {t('wizard.back')}
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="font-mono text-xs text-ink-muted hover:text-ink transition-colors"
            >
              {t('wizard.cancel')}
            </button>
          </div>
          <span className="hidden md:inline font-mono text-[11px] text-ink-muted">{t('wizard.key_hint')}</span>
        </div>

        {/* key={question.id} で質問が変わるたびに再マウントし、遷移アニメーションを再生する。
            flex-1 で下まで広げない＝CTA フッターが選択肢直下に来て視線移動を最小にする */}
        <div key={question.id} data-testid="question-area" className="animate-fade-in">
          {question.type === 'choice' && (
            <div className="grid md:grid-cols-2 gap-3 content-start">
              {(question as ChoiceQuestion).options.map((opt, i) => (
                <ChoiceCard
                  key={opt.value}
                  label={t(opt.labelKey)}
                  shortcut={SHORTCUTS[i]}
                  selected={currentAnswer === opt.value}
                  onClick={() => dispatch({ type: 'SET_ANSWER', questionId: question.id, answer: opt.value })}
                />
              ))}
            </div>
          )}
          {question.type === 'text' && (
            <TextInput
              id={question.id}
              label={t(question.titleKey)}
              value={currentAnswer}
              placeholder={t((question as TextQuestion).placeholderKey)}
              onChange={(v) => dispatch({ type: 'SET_ANSWER', questionId: question.id, answer: v })}
              onEnter={handleNext}
            />
          )}
        </div>

        {/* 進捗を励ますコーナーマスコット（fixed 右下・スクロール追従） */}
        <MascotCorner
          size={88}
          text={
            state.currentIndex === total - 1
              ? t('wizard.mascot_last')
              : t('wizard.mascot_progress', {
                  current: state.currentIndex + 1,
                  remaining: total - state.currentIndex - 1,
                })
          }
        />

        {/* CTA フッター: モバイルでは sticky bottom（多択質問でも次へが画面外に出ない）、md 以上は通常配置 */}
        <div
          data-testid="wizard-cta-footer"
          className="sticky bottom-0 md:static bg-cream border-t border-line-faint pt-3 pb-3 md:pb-0 md:pt-4 flex items-center gap-3 md:justify-end"
        >
          <span className="md:hidden flex items-center gap-2" aria-hidden="true">
            <PixelDolphin size={26} />
            <span className="font-mono text-xs text-ink-muted">
              {state.currentIndex + 1}/{total}
            </span>
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={[
              'flex-1 md:flex-none bg-orange text-white font-display font-bold rounded-card-sm px-9 py-3 text-[15px]',
              'shadow-cta-down transition-all duration-150 motion-reduce:transition-none',
              'hover:bg-orange-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2',
              canProceed()
                ? 'hover:-translate-y-px active:translate-y-[3px] active:shadow-none motion-reduce:hover:translate-y-0'
                : 'opacity-50 cursor-not-allowed',
            ].join(' ')}
          >
            {t('wizard.next')}
          </button>
        </div>
      </main>
    </div>
  )
}
