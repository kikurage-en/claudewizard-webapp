export type Plan = 'free' | 'light' | 'plus'

export type QuestionType = 'choice' | 'text'

export type ChoiceOption = {
  value: string
  labelKey: string
}

export type BaseQuestion = {
  id: string
  type: QuestionType
  titleKey: string
  subtitleKey: string
  tipKey?: string
  optional?: boolean
}

export type ChoiceQuestion = BaseQuestion & {
  type: 'choice'
  options: ChoiceOption[]
}

export type TextQuestion = BaseQuestion & {
  type: 'text'
  placeholderKey: string
  validate?: (value: string) => boolean
}

export type Question = ChoiceQuestion | TextQuestion

export type Answer = string

export type WizardState = {
  plan: Plan
  answers: Record<string, Answer>
  currentIndex: number
  isGenerating: boolean
  isDone: boolean
}

export type WizardAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_ANSWER'; questionId: string; answer: Answer }
  | { type: 'RESET' }
  | { type: 'CANCEL' }
  | { type: 'SET_GENERATING'; value: boolean }
  | { type: 'SET_DONE' }
