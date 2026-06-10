import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../components/ProgressBar'
import { LanguageProvider } from '../../i18n/context'
import type { Lang } from '../../i18n/types'

function renderBar(lang: Lang, current: number, total: number) {
  return render(
    <LanguageProvider lang={lang}>
      <ProgressBar current={current} total={total} />
    </LanguageProvider>
  )
}

describe('ProgressBar', () => {
  it('aria 属性で進捗を提示する', () => {
    renderBar('ja', 2, 6)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '6')
  })

  it('aria-label が日本語ロケールで日本語になる（英語ハードコード禁止）', () => {
    renderBar('ja', 2, 6)
    expect(screen.getByRole('progressbar', { name: '質問 2 / 6' })).toBeInTheDocument()
  })

  it('aria-label が英語ロケールで英語になる', () => {
    renderBar('en', 3, 6)
    expect(screen.getByRole('progressbar', { name: 'Question 3 / 6' })).toBeInTheDocument()
  })

  it('セグメント分割バーとして質問数ぶんのセグメントを描画する', () => {
    renderBar('ja', 2, 6)
    const segments = screen.getAllByTestId('progress-segment')
    expect(segments).toHaveLength(6)
    expect(segments.filter((s) => s.dataset.state === 'done')).toHaveLength(2)
    expect(segments.filter((s) => s.dataset.state === 'todo')).toHaveLength(4)
  })
})
