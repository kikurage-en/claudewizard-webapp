import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompletePage } from '../pages/CompletePage'
import { LanguageProvider } from '../../i18n/context'
import { AnthropicClientError } from '../../security/anthropicClient'
import { NotImplementedError } from '../../generator/generate'

// generate のみ差し替え、NotImplementedError 等の実 class は残す（mapErrorToCode の instanceof 判定に必要）
const { generateMock } = vi.hoisted(() => ({ generateMock: vi.fn() }))
vi.mock('../../generator/generate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../generator/generate')>()
  return { ...actual, generate: generateMock }
})
vi.mock('../../generator/zipBuilder', () => ({ downloadBlob: vi.fn() }))
vi.mock('../../analytics/events', () => ({ trackEvent: vi.fn() }))

import { downloadBlob } from '../../generator/zipBuilder'
import { trackEvent } from '../../analytics/events'

const mockAnswers = { q1: 'software', q2: 'TestProject', stack: 'ts' }

function renderComplete(plan: 'free' | 'light' | 'plus' = 'free', onTryAgain = vi.fn()) {
  return render(
    <LanguageProvider lang="ja">
      <CompletePage lang="ja" plan={plan} answers={mockAnswers} onTryAgain={onTryAgain} />
    </LanguageProvider>
  )
}

describe('CompletePage（統一フロー: 同意 → 生成 → DL）', () => {
  beforeEach(() => {
    generateMock.mockReset()
    generateMock.mockResolvedValue(new Blob(['test'], { type: 'application/zip' }))
    vi.mocked(downloadBlob).mockClear()
    vi.mocked(trackEvent).mockClear()
  })

  it('生成ファイル一覧が表示される', () => {
    renderComplete('free')
    expect(screen.getByText('CLAUDE.md')).toBeInTheDocument()
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })

  it('初期状態ではダウンロードボタンが無効・generate 未呼出', () => {
    renderComplete('free')
    expect(screen.getByRole('button', { name: /ダウンロード|download/i })).toBeDisabled()
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('同意なしでダウンロードボタンをクリックしても generate は実行されない', () => {
    renderComplete('free')
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード|download/i }))
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('同意 + ボタンで generate と downloadBlob が呼ばれる', async () => {
    renderComplete('free')
    fireEvent.click(screen.getByRole('checkbox'))
    const btn = screen.getByRole('button', { name: /ダウンロード|download/i })
    expect(btn).not.toBeDisabled()
    fireEvent.click(btn)
    await waitFor(() => expect(generateMock).toHaveBeenCalledWith('free', 'ja', mockAnswers))
    await waitFor(() => expect(vi.mocked(downloadBlob)).toHaveBeenCalled())
  })

  it('生成失敗で ErrorBanner 表示 ＋ error_occurred が code 別に発火', async () => {
    generateMock.mockReset()
    generateMock.mockRejectedValue(new AnthropicClientError('invalid', 'auth'))
    renderComplete('light')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード|download/i }))
    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    expect(screen.getByTestId('error-banner')).toHaveAttribute('data-code', 'auth')
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('error_occurred', { error_type: 'auth' })
  })

  it('リトライ成功で ErrorBanner が消える（errorCode クリア）', async () => {
    generateMock.mockReset()
    generateMock
      .mockRejectedValueOnce(new AnthropicClientError('server down', 'server'))
      .mockResolvedValueOnce(new Blob(['x']))
    renderComplete('light')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード|download/i }))
    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    // server = auto_recovery → 再試行ボタンあり
    fireEvent.click(screen.getByRole('button', { name: '再試行' }))
    await waitFor(() => expect(screen.queryByTestId('error-banner')).not.toBeInTheDocument())
    expect(vi.mocked(downloadBlob)).toHaveBeenCalled()
  })

  it('Plus は NotImplementedError → unavailable(fatal) で再試行ボタンが出ない（futile loop 防止）', async () => {
    generateMock.mockReset()
    generateMock.mockRejectedValue(new NotImplementedError('plus'))
    renderComplete('plus')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード|download/i }))
    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-code', 'unavailable')
    expect(banner).toHaveAttribute('data-category', 'fatal')
    expect(screen.queryByRole('button', { name: '再試行' })).not.toBeInTheDocument()
  })

  it('ファイル一覧が plan 別の数になる（free=4 / light=5 / plus=9）', () => {
    const counts: Record<string, number> = {}
    for (const plan of ['free', 'light', 'plus'] as const) {
      const { container, unmount } = render(
        <LanguageProvider lang="ja">
          <CompletePage lang="ja" plan={plan} answers={mockAnswers} onTryAgain={vi.fn()} />
        </LanguageProvider>
      )
      counts[plan] = container.querySelectorAll('ul code').length
      unmount()
    }
    expect(counts).toEqual({ free: 4, light: 5, plus: 9 })
  })

  it('もう一度試すボタンで onTryAgain が呼ばれる', () => {
    const onTryAgain = vi.fn()
    renderComplete('free', onTryAgain)
    fireEvent.click(screen.getByRole('button', { name: /もう一度/i }))
    expect(onTryAgain).toHaveBeenCalledTimes(1)
  })
})
