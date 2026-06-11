import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import {
  PixelDolphin,
  DOLPHIN_GRID,
  DOLPHIN_VIEWBOX_PAD,
  DOLPHIN_BOB_AMPLITUDE,
  DOLPHIN_SWAY_AMPLITUDE,
} from '../components/PixelDolphin'

// reduced-motion の有無を切り替える（test-setup の既定は reduce=ON）
function setMatchMedia(reducedMotion: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: reducedMotion && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia
}

describe('PixelDolphin', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
    })
    // 尾びれ/胸びれ/スピン位相の乱数を固定し決定的にする
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    setMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('SVG ドット絵として描画される（rect が存在する）', () => {
    const { container } = render(<PixelDolphin size={120} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(50)
  })

  it('装飾用途のため SVG に aria-hidden が付与される', () => {
    const { container } = render(<PixelDolphin size={48} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('animate=true で時間経過により transform（bob/sway/tilt）が更新される', () => {
    const { container } = render(<PixelDolphin size={48} />)
    const g = container.querySelector('g')!
    const before = g.getAttribute('transform')
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(g.getAttribute('transform')).not.toBe(before)
  })

  it('animate=false ではタイマーが走らず静止する', () => {
    const { container } = render(<PixelDolphin size={48} animate={false} />)
    expect(vi.getTimerCount()).toBe(0)
    const g = container.querySelector('g')!
    const before = g.getAttribute('transform')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(g.getAttribute('transform')).toBe(before)
  })

  it('prefers-reduced-motion: reduce では animate=true でも静止する（NFR-4）', () => {
    setMatchMedia(true)
    render(<PixelDolphin size={48} />)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('unmount で全タイマー・rAF がクリーンアップされる（リーク防止）', () => {
    const { unmount } = render(<PixelDolphin size={48} />)
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('SVG が overflow: hidden で描画される（モバイル横はみ出し対策）', () => {
    // visible だと iOS Safari が SVG 描画域を文書スクロール領域に算入し横はみ出しの一因になる
    const { container } = render(<PixelDolphin size={48} />)
    expect(container.querySelector('svg')!.style.overflow).toBe('hidden')
  })

  it('全アニメーション極値で viewBox からはみ出さない（overflow: hidden のクリップ安全性）', () => {
    // 回転（tilt/spin）はスプライト中心基準なので最大到達半径は半対角 (GRID/2)·√2。
    // 並進（bob/sway）は直交軸のため合成は √(bob²+sway²)。
    // これが viewBox の中心からの許容半径 GRID/2 + PAD を超えると、
    // overflow: hidden 化によりスピン中のピクセルが視覚的に切れてしまう。
    // 振幅や pad を変更する際はこの不変条件を保つこと。
    const halfDiagonal = (DOLPHIN_GRID / 2) * Math.SQRT2
    const translateMax = Math.hypot(DOLPHIN_BOB_AMPLITUDE, DOLPHIN_SWAY_AMPLITUDE)
    const allowedRadius = DOLPHIN_GRID / 2 + DOLPHIN_VIEWBOX_PAD
    expect(halfDiagonal + translateMax).toBeLessThanOrEqual(allowedRadius)
  })

  it('複数インスタンスが同時に描画できる', () => {
    const { container } = render(
      <>
        <PixelDolphin size={24} />
        <PixelDolphin size={96} />
      </>
    )
    expect(container.querySelectorAll('svg').length).toBe(2)
  })
})
