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

  it('ファイル一覧が plan 別の数になる（free=5 / light=8 / plus=9）', () => {
    const counts: Record<string, number> = {}
    for (const plan of ['free', 'light', 'plus'] as const) {
      const { container, unmount } = render(
        <LanguageProvider lang="ja">
          <CompletePage lang="ja" plan={plan} answers={mockAnswers} onTryAgain={vi.fn()} />
        </LanguageProvider>
      )
      counts[plan] = container.querySelectorAll('[data-testid="file-item"]').length
      unmount()
    }
    expect(counts).toEqual({ free: 5, light: 8, plus: 9 })
  })

  it('トップへ戻るボタンで onTryAgain が呼ばれる（CTA は DL/トップ/シェアの3系統）', () => {
    const onTryAgain = vi.fn()
    renderComplete('free', onTryAgain)
    fireEvent.click(screen.getByRole('button', { name: /トップへ戻る/ }))
    expect(onTryAgain).toHaveBeenCalledTimes(1)
  })

  it('DONE バッジと完了ドット（質問数ぶん）が表示される', () => {
    renderComplete('free')
    expect(screen.getByTestId('done-badge')).toBeInTheDocument()
    // free は 3 問 → ドット 3 個
    expect(screen.getAllByTestId('complete-dot')).toHaveLength(3)
  })

  it('コーナーマスコットがお祝いの吹き出しを表示する', () => {
    renderComplete('free')
    expect(screen.getByText('おつかれさまでした！🎉')).toBeInTheDocument()
  })

  it('Web Share API 非対応環境ではシェアボタンを表示しない', () => {
    renderComplete('free')
    expect(screen.queryByRole('button', { name: /シェア/ })).not.toBeInTheDocument()
  })

  it('エラーバナー表示中は下のフォームが無効化される（opacity + pointer-events）', async () => {
    generateMock.mockReset()
    generateMock.mockRejectedValue(new AnthropicClientError('invalid', 'auth'))
    renderComplete('light')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード|download/i }))
    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    const form = screen.getByTestId('complete-form')
    expect(form.className).toContain('pointer-events-none')
    expect(form.className).toContain('opacity-50')
    // バナーを閉じると再び操作可能
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(screen.getByTestId('complete-form').className).not.toContain('pointer-events-none')
  })
})

// 生成は DL ボタン押下時に 1 回だけ実行し、Blob をブラウザ内に保持する（Light の API 再課金防止）。
// 画面は生成前（準備完了）/ 生成後（完成）の 2 状態で、文言と実態を一致させる。
describe('CompletePage（2 状態表示 + Blob キャッシュ）', () => {
  beforeEach(() => {
    generateMock.mockReset()
    generateMock.mockResolvedValue(new Blob(['test'], { type: 'application/zip' }))
    vi.mocked(downloadBlob).mockClear()
    vi.mocked(trackEvent).mockClear()
  })

  it('DL を 2 回実行しても generate は 1 回のみ・downloadBlob は 2 回（API 再課金なし）', async () => {
    renderComplete('light')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード/i }))
    await waitFor(() => expect(vi.mocked(downloadBlob)).toHaveBeenCalledTimes(1))

    // 生成後は「再ダウンロード」ラベルになり、クリックしても generate は走らない
    fireEvent.click(screen.getByRole('button', { name: /再ダウンロード/ }))
    await waitFor(() => expect(vi.mocked(downloadBlob)).toHaveBeenCalledTimes(2))
    expect(generateMock).toHaveBeenCalledTimes(1)
    // ダウンロード数の計測（zip_download）は 2 回とも発火する
    expect(
      vi.mocked(trackEvent).mock.calls.filter(([name]) => name === 'zip_download')
    ).toHaveLength(2)
  })

  it('生成前は「準備完了」表示で ✓ なし、生成成功後に「完成！生成されました」+ ✓ に切替', async () => {
    renderComplete('light')
    // 生成前: 完了系文言・✓ が出ない（文言と実態の整合）
    expect(screen.getByText('準備完了！')).toBeInTheDocument()
    expect(screen.queryByText('完成！')).not.toBeInTheDocument()
    expect(screen.queryByText('設定ファイルが生成されました')).not.toBeInTheDocument()
    expect(screen.getByText(/FILES TO GENERATE/)).toBeInTheDocument()
    expect(screen.queryAllByText('✓')).toHaveLength(0)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード/i }))

    // 生成後: 完成表示・GENERATED FILES・全行 ✓・再ダウンロードラベル
    await waitFor(() => expect(screen.getByText('完成！')).toBeInTheDocument())
    expect(screen.getByText('設定ファイルが生成されました')).toBeInTheDocument()
    expect(screen.queryByText('準備完了！')).not.toBeInTheDocument()
    expect(screen.getByText(/GENERATED FILES/)).toBeInTheDocument()
    expect(screen.getAllByText('✓')).toHaveLength(8) // light = 8 ファイル
    expect(screen.getByRole('button', { name: /再ダウンロード/ })).toBeInTheDocument()
  })

  it('生成失敗時はキャッシュされず準備完了表示のまま、リトライで generate が再実行される', async () => {
    generateMock.mockReset()
    generateMock
      .mockRejectedValueOnce(new AnthropicClientError('server down', 'server'))
      .mockResolvedValueOnce(new Blob(['x']))
    renderComplete('light')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /ダウンロード/i }))
    await waitFor(() => expect(screen.getByTestId('error-banner')).toBeInTheDocument())
    // 失敗時は完成に切り替わらない（false DONE の防止）
    expect(screen.queryByText('設定ファイルが生成されました')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '再試行' }))
    await waitFor(() => expect(vi.mocked(downloadBlob)).toHaveBeenCalledTimes(1))
    expect(generateMock).toHaveBeenCalledTimes(2)
  })

  it('課金注記（API 1 回のみ・再 DL 課金なし）は light のみ表示・free では非表示', () => {
    const { unmount } = renderComplete('light')
    expect(screen.getByText(/追加の課金は発生しません/)).toBeInTheDocument()
    unmount()
    renderComplete('free')
    expect(screen.queryByText(/追加の課金は発生しません/)).not.toBeInTheDocument()
  })
})
