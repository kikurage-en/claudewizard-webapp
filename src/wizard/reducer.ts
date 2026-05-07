import type { WizardState, WizardAction } from './types'
import { getQuestions } from './questions'

export function createInitialState(plan: WizardState['plan']): WizardState {
  return {
    plan,
    answers: {},
    currentIndex: 0,
    isGenerating: false,
    isDone: false,
  }
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const questions = getQuestions(state.plan)
  const total = questions.length

  switch (action.type) {
    case 'SET_ANSWER': {
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      }
    }
    case 'NEXT': {
      if (state.currentIndex < total - 1) {
        return { ...state, currentIndex: state.currentIndex + 1 }
      }
      return state
    }
    case 'BACK': {
      if (state.currentIndex > 0) {
        return { ...state, currentIndex: state.currentIndex - 1 }
      }
      return state
    }
    case 'SET_GENERATING': {
      return { ...state, isGenerating: action.value }
    }
    case 'SET_DONE': {
      return { ...state, isGenerating: false, isDone: true }
    }
    case 'RESET':
    case 'CANCEL': {
      return createInitialState(state.plan)
    }
    default:
      return state
  }
}
