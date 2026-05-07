import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopPage } from '../pages/TopPage'
import { LanguageProvider } from '../../i18n/context'

function renderTopPage(onSelectPlan = vi.fn()) {
  return render(
    <LanguageProvider lang="ja">
      <TopPage lang="ja" onSelectPlan={onSelectPlan} />
    </LanguageProvider>
  )
}

describe('TopPage', () => {
  it('3プランが表示される', () => {
    renderTopPage()
    expect(screen.getByText('フリー')).toBeInTheDocument()
    expect(screen.getByText('ライト')).toBeInTheDocument()
    expect(screen.getByText('プラス')).toBeInTheDocument()
  })

  it('Free プランを選択するとコールバックが呼ばれる', () => {
    const onSelectPlan = vi.fn()
    renderTopPage(onSelectPlan)
    const freeCard = screen.getByRole('button', { name: /フリー/ })
    fireEvent.click(freeCard)
    expect(onSelectPlan).toHaveBeenCalledWith('free')
  })

  it('Light プランは選択可能（Phase 2 で有効化）', () => {
    const onSelectPlan = vi.fn()
    renderTopPage(onSelectPlan)
    const lightCard = screen.getByRole('button', { name: /ライト/ })
    expect(lightCard).toHaveAttribute('aria-disabled', 'false')
    fireEvent.click(lightCard)
    expect(onSelectPlan).toHaveBeenCalledWith('light')
  })

  it('Plus プランは無効（Coming Soon）', () => {
    renderTopPage()
    const plusCard = screen.getByRole('button', { name: /プラス/ })
    expect(plusCard).toHaveAttribute('aria-disabled', 'true')
  })

  it('ヒーローセクションのCTAが表示される', () => {
    renderTopPage()
    expect(screen.getByRole('link', { name: /無料で始める/ })).toBeInTheDocument()
  })
})
