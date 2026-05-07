import type { Question } from './types'

export const FREE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'choice',
    titleKey: 'wizard.q1.title',
    subtitleKey: 'wizard.q1.subtitle',
    tipKey: 'wizard.q1.tip',
    options: [
      { value: 'software', labelKey: 'wizard.q1.options.software' },
      { value: 'data-research', labelKey: 'wizard.q1.options.data-research' },
      { value: 'writing', labelKey: 'wizard.q1.options.writing' },
      { value: 'sns', labelKey: 'wizard.q1.options.sns' },
      { value: 'automation', labelKey: 'wizard.q1.options.automation' },
      { value: 'design', labelKey: 'wizard.q1.options.design' },
      { value: 'other', labelKey: 'wizard.q1.options.other' },
    ],
  },
  {
    id: 'q2',
    type: 'text',
    titleKey: 'wizard.q2.title',
    subtitleKey: 'wizard.q2.subtitle',
    placeholderKey: 'wizard.q2.placeholder',
    tipKey: 'wizard.q2.tip',
    validate: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value.trim()) && value.trim().length > 0,
  },
  {
    id: 'q3',
    type: 'choice',
    titleKey: 'wizard.q3.title',
    subtitleKey: 'wizard.q3.subtitle',
    options: [
      { value: 'create', labelKey: 'wizard.q3.options.create' },
      { value: 'investigate', labelKey: 'wizard.q3.options.investigate' },
      { value: 'improve', labelKey: 'wizard.q3.options.improve' },
      { value: 'review', labelKey: 'wizard.q3.options.review' },
      { value: 'mixed', labelKey: 'wizard.q3.options.mixed' },
    ],
  },
  {
    id: 'q4',
    type: 'choice',
    titleKey: 'wizard.q4.title',
    subtitleKey: 'wizard.q4.subtitle',
    options: [
      { value: 'programming', labelKey: 'wizard.q4.options.programming' },
      { value: 'office', labelKey: 'wizard.q4.options.office' },
      { value: 'creative', labelKey: 'wizard.q4.options.creative' },
      { value: 'sns', labelKey: 'wizard.q4.options.sns' },
      { value: 'cli', labelKey: 'wizard.q4.options.cli' },
      { value: 'other', labelKey: 'wizard.q4.options.other' },
    ],
  },
  {
    id: 'q5',
    type: 'choice',
    titleKey: 'wizard.q5.title',
    subtitleKey: 'wizard.q5.subtitle',
    options: [
      { value: 'speed', labelKey: 'wizard.q5.options.speed' },
      { value: 'quality', labelKey: 'wizard.q5.options.quality' },
      { value: 'learning', labelKey: 'wizard.q5.options.learning' },
      { value: 'team', labelKey: 'wizard.q5.options.team' },
    ],
  },
]

export const Q6: Question = {
  id: 'q6',
  type: 'text',
  titleKey: 'wizard.q6.title',
  subtitleKey: 'wizard.q6.subtitle',
  placeholderKey: 'wizard.q6.placeholder',
  tipKey: 'wizard.q6.tip',
  optional: true,
}

export const LIGHT_PLUS_QUESTIONS: Question[] = [...FREE_QUESTIONS, Q6]

export function getQuestions(plan: 'free' | 'light' | 'plus'): Question[] {
  if (plan === 'light' || plan === 'plus') {
    return LIGHT_PLUS_QUESTIONS
  }
  return FREE_QUESTIONS
}
