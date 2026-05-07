import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '../context'
import { useTranslation } from '../useTranslation'

function TestComponent({ keyStr, vars }: { keyStr: string; vars?: Record<string, string | number> }) {
  const { t } = useTranslation()
  return <span>{t(keyStr, vars)}</span>
}

function renderWithLang(lang: 'ja' | 'en', keyStr: string, vars?: Record<string, string | number>) {
  render(
    <LanguageProvider lang={lang}>
      <TestComponent keyStr={keyStr} vars={vars} />
    </LanguageProvider>
  )
}

describe('useTranslation - t()', () => {
  it('resolves a top-level key in Japanese', () => {
    renderWithLang('ja', 'common.next')
    expect(screen.getByText('次へ')).toBeTruthy()
  })

  it('resolves a top-level key in English', () => {
    renderWithLang('en', 'common.next')
    expect(screen.getByText('Next')).toBeTruthy()
  })

  it('resolves a nested key', () => {
    renderWithLang('ja', 'wizard.q1.title')
    expect(screen.getByText('主にどの分野で Claude を使いますか？')).toBeTruthy()
  })

  it('resolves wizard option key', () => {
    renderWithLang('ja', 'wizard.q1.options.software')
    expect(screen.getByText('ソフトウェア開発（Web・モバイル・API・インフラなど）')).toBeTruthy()
  })

  it('interpolates {{name}} variable', () => {
    renderWithLang('ja', 'wizard.question_of', { current: '2', total: '5' })
    expect(screen.getByText('質問 2 / 5')).toBeTruthy()
  })

  it('resolves wizard.q1.title in English', () => {
    renderWithLang('en', 'wizard.q1.title')
    expect(screen.getByText('What field do you mainly use Claude for?')).toBeTruthy()
  })

  it('returns the key itself when not found in any language', () => {
    renderWithLang('ja', 'nonexistent.key')
    expect(screen.getByText('nonexistent.key')).toBeTruthy()
  })

  it('resolves plans.free.name in Japanese', () => {
    renderWithLang('ja', 'plans.free.name')
    expect(screen.getByText('フリー')).toBeTruthy()
  })

  it('resolves plans.free.name in English', () => {
    renderWithLang('en', 'plans.free.name')
    expect(screen.getByText('Free')).toBeTruthy()
  })
})
