import { useEffect, useCallback } from 'react'
import { useWizard } from '../../wizard/WizardProvider'
import { getQuestions } from '../../wizard/questions'
import { useTranslation } from '../../i18n/useTranslation'
import { ProgressBar } from '../components/ProgressBar'
import { ChoiceCard } from '../components/ChoiceCard'
import { TextInput } from '../components/TextInput'
import type { Lang } from '../../i18n/types'
import type { ChoiceQuestion, TextQuestion } from '../../wizard/types'
import { trackEvent } from '../../analytics/events'

const SHORTCUTS = ['A', 'B', 'C', 'D', 'E', 'F']

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') {
        handleNext()
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
  }, [handleNext, question, dispatch])

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      <aside className="bg-ink text-dark-card-surface md:w-5/12 p-8 flex flex-col gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest mb-1">
            <span className="text-orange">{t('wizard.question_of', { current: state.currentIndex + 1, total })}</span>
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl leading-tight mb-3">
            {t(question.titleKey)}
          </h1>
          <p className="text-ink-faint text-sm">{t(question.subtitleKey)}</p>
        </div>

        <ProgressBar current={state.currentIndex + 1} total={total} />

        {question.tipKey && (
          <div className="border border-dashed border-dark-card-divider rounded-lg p-4 mt-auto">
            <p className="text-xs font-bold text-orange mb-1">{t('wizard.tip_label')}</p>
            <p className="text-xs text-ink-faint">{t(question.tipKey)}</p>
          </div>
        )}
      </aside>

      <main className="flex-1 p-8 flex flex-col gap-6">
        <div className="flex-1 flex flex-col gap-3">
          {question.type === 'choice' && (
            <>
              {(question as ChoiceQuestion).options.map((opt, i) => (
                <ChoiceCard
                  key={opt.value}
                  label={t(opt.labelKey)}
                  shortcut={SHORTCUTS[i]}
                  selected={currentAnswer === opt.value}
                  onClick={() => dispatch({ type: 'SET_ANSWER', questionId: question.id, answer: opt.value })}
                />
              ))}
            </>
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

        <div className="flex items-center justify-between pt-4 border-t border-line-faint">
          <div className="flex gap-4">
            {state.currentIndex > 0 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'BACK' })}
                className="text-sm text-ink-muted hover:text-ink transition-colors"
              >
                ← {t('wizard.back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => { dispatch({ type: 'CANCEL' }); onCancel() }}
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              {t('wizard.cancel')}
            </button>
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={[
              'btn-primary px-6 py-2 text-sm',
              !canProceed() ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {t('wizard.next')}
          </button>
        </div>
      </main>
    </div>
  )
}
