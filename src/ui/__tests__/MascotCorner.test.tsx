import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MascotCorner } from '../components/MascotCorner'

describe('MascotCorner', () => {
  it('装飾要素として aria-hidden かつ pointer-events を奪わない', () => {
    render(<MascotCorner text="はじめましょう！" />)
    const corner = screen.getByTestId('mascot-corner')
    expect(corner).toHaveAttribute('aria-hidden', 'true')
    expect(corner.className).toContain('pointer-events-none')
  })

  it('ビューポート右下に固定配置される（スクロール追従 = fixed。absolute では長いページで見切れる）', () => {
    render(<MascotCorner text="はじめましょう！" />)
    const corner = screen.getByTestId('mascot-corner')
    expect(corner.className).toContain('fixed')
    expect(corner.className).not.toContain('absolute')
  })

  it('吹き出しテキストとイルカが表示される', () => {
    const { container } = render(<MascotCorner text="2問目、あと4問です！" />)
    expect(screen.getByText('2問目、あと4問です！')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('テキストなしでは吹き出しを出さずイルカのみ表示する', () => {
    const { container } = render(<MascotCorner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="mascot-bubble"]')).not.toBeInTheDocument()
  })
})
