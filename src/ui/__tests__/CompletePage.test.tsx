import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompletePage } from '../pages/CompletePage'
import { LanguageProvider } from '../../i18n/context'

vi.mock('../../generator/generate', () => ({
  generate: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/zip' })),
}))
vi.mock('../../generator/zipBuilder', () => ({
  downloadBlob: vi.fn(),
}))
vi.mock('../../analytics/events', () => ({
  trackEvent: vi.fn(),
}))

const mockAnswers = {
  domain: 'web',
  project_name: 'TestProject',
  work_type: 'feature',
  tech_stack: 'react',
  goal: 'speed',
}

function renderCompletePage(onTryAgain = vi.fn()) {
  return render(
    <LanguageProvider lang="ja">
      <CompletePage
        lang="ja"
        plan="free"
        answers={mockAnswers}
        onTryAgain={onTryAgain}
      />
    </LanguageProvider>
  )
}

describe('CompletePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('生成ファイル一覧が表示される', () => {
    renderCompletePage()
    expect(screen.getByText('CLAUDE.md')).toBeInTheDocument()
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })

  it('初期状態ではダウンロードボタンが無効', () => {
    renderCompletePage()
    const downloadBtn = screen.getByRole('button', { name: /ダウンロード|download/i })
    expect(downloadBtn).toBeDisabled()
  })

  it('同意チェックを入れるとダウンロードボタンが有効になる', async () => {
    renderCompletePage()
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /ダウンロード|download/i })
      expect(downloadBtn).not.toBeDisabled()
    })
  })

  it('同意なしでダウンロードボタンをクリックしても実行されない', async () => {
    const { generate } = await import('../../generator/generate')
    renderCompletePage()
    const downloadBtn = screen.getByRole('button', { name: /ダウンロード|download/i })
    fireEvent.click(downloadBtn)
    expect(generate).not.toHaveBeenCalled()
  })

  it('同意後にダウンロードボタンをクリックするとZIPが生成される', async () => {
    const { generate } = await import('../../generator/generate')
    renderCompletePage()
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    await waitFor(() => {
      const downloadBtn = screen.getByRole('button', { name: /ダウンロード|download/i })
      expect(downloadBtn).not.toBeDisabled()
    })
    const downloadBtn = screen.getByRole('button', { name: /ダウンロード|download/i })
    fireEvent.click(downloadBtn)
    await waitFor(() => {
      expect(generate).toHaveBeenCalledWith('free', 'ja', mockAnswers)
    })
  })

  it('もう一度試すボタンでonTryAgainが呼ばれる', () => {
    const onTryAgain = vi.fn()
    renderCompletePage(onTryAgain)
    const tryAgainBtn = screen.getByRole('button', { name: /もう一度/i })
    fireEvent.click(tryAgainBtn)
    expect(onTryAgain).toHaveBeenCalledTimes(1)
  })
})
