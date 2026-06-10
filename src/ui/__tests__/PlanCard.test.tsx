import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanCard } from '../components/PlanCard'
import { LanguageProvider } from '../../i18n/context'
import type { Plan } from '../../wizard/types'

function renderCard(plan: Plan, onSelect = vi.fn(), disabled = false) {
  return render(
    <LanguageProvider lang="ja">
      <PlanCard plan={plan} onSelect={onSelect} disabled={disabled} />
    </LanguageProvider>
  )
}

describe('PlanCard', () => {
  it('カードはネイティブ button 要素として描画される（キーボード操作の標準挙動）', () => {
    renderCard('free')
    const card = screen.getByRole('button', { name: /フリー/ })
    expect(card.tagName).toBe('BUTTON')
  })

  it('Free カードのクリックで onSelect が呼ばれる', () => {
    const onSelect = vi.fn()
    renderCard('free', onSelect)
    fireEvent.click(screen.getByRole('button', { name: /フリー/ }))
    expect(onSelect).toHaveBeenCalledWith('free')
  })

  it('Plus カードに RECOMMENDED バッジが表示される', () => {
    renderCard('plus')
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument()
  })

  it('Plus カードは Coming Soon で無効（クリック不可）', () => {
    const onSelect = vi.fn()
    renderCard('plus', onSelect)
    const card = screen.getByRole('button', { name: /プラス/ })
    expect(card).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(card)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('Light カードは選択可能', () => {
    const onSelect = vi.fn()
    renderCard('light', onSelect)
    const card = screen.getByRole('button', { name: /ライト/ })
    expect(card).toHaveAttribute('aria-disabled', 'false')
    fireEvent.click(card)
    expect(onSelect).toHaveBeenCalledWith('light')
  })
})
