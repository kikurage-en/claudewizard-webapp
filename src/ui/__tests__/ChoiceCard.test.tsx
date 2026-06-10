import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChoiceCard } from '../components/ChoiceCard'

describe('ChoiceCard', () => {
  it('button 要素として描画され aria-pressed で選択状態を示す', () => {
    render(<ChoiceCard label="ソフトウェア開発" shortcut="A" selected={false} onClick={vi.fn()} />)
    const card = screen.getByRole('button', { name: /ソフトウェア開発/ })
    expect(card.tagName).toBe('BUTTON')
    expect(card).toHaveAttribute('aria-pressed', 'false')
  })

  it('selected=true で aria-pressed=true とチェック表示になる', () => {
    render(<ChoiceCard label="ソフトウェア開発" shortcut="A" selected={true} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('choice-check')).toHaveAttribute('data-checked', 'true')
  })

  it('クリックで onClick が呼ばれる', () => {
    const onClick = vi.fn()
    render(<ChoiceCard label="Python" shortcut="B" selected={false} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ショートカットラベルが表示される', () => {
    render(<ChoiceCard label="Go" shortcut="C" selected={false} onClick={vi.fn()} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
