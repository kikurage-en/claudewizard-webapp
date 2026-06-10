import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'

// /complete はメモリ上の完了状態（completedState）が前提のルート。
// リロード・直リンクで状態が失われた場合に CompletePage（＝生成ボタン）へ到達させない
// ガードを deterministic に固定する（空回答での generate / Light の API 課金経路の遮断）。

vi.mock('../../analytics/events', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackPlanSelect: vi.fn(),
  trackLanguageSwitch: vi.fn(),
}))
const { generateMock } = vi.hoisted(() => ({ generateMock: vi.fn() }))
vi.mock('../../generator/generate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../generator/generate')>()
  return { ...actual, generate: generateMock }
})
vi.mock('../../generator/zipBuilder', () => ({ downloadBlob: vi.fn() }))

describe('App（/complete ガード: リロード・直リンクで完了状態がない場合）', () => {
  beforeEach(() => {
    generateMock.mockReset()
    generateMock.mockResolvedValue(new Blob(['x'], { type: 'application/zip' }))
    window.location.hash = '#/ja'
  })

  it('完了状態なしの #/ja/complete では CompletePage を出さず、トップへリダイレクトする', async () => {
    window.location.hash = '#/ja/complete'
    render(<App />)

    // CompletePage の同意チェック・DL ボタンが存在しない＝空回答で generate に到達する経路がない
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ZIP を(再)?ダウンロード/ })).not.toBeInTheDocument()
    expect(generateMock).not.toHaveBeenCalled()

    // URL もトップへ正規化される（表示と URL・page_view 計測の不一致を残さない）
    await waitFor(() => expect(window.location.hash).toBe('#/ja'))
    expect(screen.getByText('フリー')).toBeInTheDocument() // トップ（プラン選択）が表示される
  })

  it('ウィザード完走後の /complete は CompletePage（準備完了）を表示する（ガードの誤爆なし）', async () => {
    render(<App />)

    // Free プランを選択 → ウィザードへ
    fireEvent.click(screen.getByRole('button', { name: /フリー/ }))
    await waitFor(() => expect(window.location.hash).toBe('#/ja/wizard'))

    // Q1: 分野（choice）
    await waitFor(() => expect(screen.getByText(/質問 1 \/ 3/)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[0])
    fireEvent.click(screen.getByRole('button', { name: /次へ/i }))

    // Q2: プロジェクト名（text）
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'guard-test' } })
    fireEvent.click(screen.getByRole('button', { name: /次へ/i }))

    // Q3: 言語（choice）→ 完了
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[0])
    fireEvent.click(screen.getByRole('button', { name: /次へ/i }))

    // 完了画面（生成前の準備完了状態）が表示され、URL は /complete のまま維持される
    await waitFor(() => expect(screen.getByText('準備完了！')).toBeInTheDocument())
    expect(window.location.hash).toBe('#/ja/complete')
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(generateMock).not.toHaveBeenCalled() // 表示しただけでは生成されない
  })
})
