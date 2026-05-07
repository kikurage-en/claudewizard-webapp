import { describe, it, expect } from 'vitest'
import { wizardReducer, createInitialState } from '../reducer'

describe('wizardReducer', () => {
  const initial = createInitialState('free')

  it('initializes with correct defaults', () => {
    expect(initial.plan).toBe('free')
    expect(initial.currentIndex).toBe(0)
    expect(initial.answers).toEqual({})
    expect(initial.isGenerating).toBe(false)
    expect(initial.isDone).toBe(false)
  })

  it('SET_ANSWER stores an answer', () => {
    const state = wizardReducer(initial, {
      type: 'SET_ANSWER',
      questionId: 'q1',
      answer: 'frontend',
    })
    expect(state.answers.q1).toBe('frontend')
  })

  it('SET_ANSWER does not mutate existing answers', () => {
    const s1 = wizardReducer(initial, { type: 'SET_ANSWER', questionId: 'q1', answer: 'frontend' })
    const s2 = wizardReducer(s1, { type: 'SET_ANSWER', questionId: 'q2', answer: 'my-project' })
    expect(s2.answers.q1).toBe('frontend')
    expect(s2.answers.q2).toBe('my-project')
  })

  it('NEXT advances currentIndex', () => {
    const state = wizardReducer(initial, { type: 'NEXT' })
    expect(state.currentIndex).toBe(1)
  })

  it('NEXT does not exceed total questions', () => {
    let state = createInitialState('free')
    for (let i = 0; i < 10; i++) {
      state = wizardReducer(state, { type: 'NEXT' })
    }
    expect(state.currentIndex).toBe(4)
  })

  it('BACK decrements currentIndex', () => {
    const s1 = wizardReducer(initial, { type: 'NEXT' })
    const s2 = wizardReducer(s1, { type: 'BACK' })
    expect(s2.currentIndex).toBe(0)
  })

  it('BACK does not go below 0', () => {
    const state = wizardReducer(initial, { type: 'BACK' })
    expect(state.currentIndex).toBe(0)
  })

  it('SET_GENERATING sets isGenerating flag', () => {
    const s1 = wizardReducer(initial, { type: 'SET_GENERATING', value: true })
    expect(s1.isGenerating).toBe(true)
    const s2 = wizardReducer(s1, { type: 'SET_GENERATING', value: false })
    expect(s2.isGenerating).toBe(false)
  })

  it('SET_DONE sets isDone and clears isGenerating', () => {
    const s1 = wizardReducer(initial, { type: 'SET_GENERATING', value: true })
    const s2 = wizardReducer(s1, { type: 'SET_DONE' })
    expect(s2.isDone).toBe(true)
    expect(s2.isGenerating).toBe(false)
  })

  it('RESET returns to initial state', () => {
    let state = wizardReducer(initial, { type: 'SET_ANSWER', questionId: 'q1', answer: 'frontend' })
    state = wizardReducer(state, { type: 'NEXT' })
    state = wizardReducer(state, { type: 'RESET' })
    expect(state.currentIndex).toBe(0)
    expect(state.answers).toEqual({})
  })

  it('CANCEL returns to initial state', () => {
    let state = wizardReducer(initial, { type: 'SET_ANSWER', questionId: 'q1', answer: 'backend' })
    state = wizardReducer(state, { type: 'CANCEL' })
    expect(state.currentIndex).toBe(0)
    expect(state.answers).toEqual({})
  })
})
