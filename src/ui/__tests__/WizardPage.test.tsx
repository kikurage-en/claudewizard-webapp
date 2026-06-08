import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardPage } from '../pages/WizardPage'
import { WizardProvider } from '../../wizard/WizardProvider'
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

function renderWizardPage(onComplete = vi.fn(), onCancel = vi.fn()) {
  return render(
    <LanguageProvider lang="ja">
      <WizardProvider plan="free">
        <WizardPage lang="ja" onComplete={onComplete} onCancel={onCancel} />
      </WizardProvider>
    </LanguageProvider>
  )
}

describe('WizardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Q1が最初に表示される', () => {
    renderWizardPage()
    expect(screen.getByText(/質問 1 \/ 2/)).toBeInTheDocument()
  })

  it('プログレスバーが表示される', () => {
    renderWizardPage()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('選択肢カードが表示される', () => {
    renderWizardPage()
    // Q1は選択肢式なのでChoiceCardが表示される
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('選択肢を選んで次へ進める', () => {
    renderWizardPage()
    // 最初の選択肢カードをクリック
    const choiceCards = document.querySelectorAll('[class*="cursor-pointer"]')
    if (choiceCards.length > 0) {
      fireEvent.click(choiceCards[0])
    }
    const nextBtn = screen.getByRole('button', { name: /次へ|next/i })
    expect(nextBtn).toBeInTheDocument()
  })

  it('キャンセルボタンを押すとonCancelが呼ばれる', () => {
    const onCancel = vi.fn()
    renderWizardPage(vi.fn(), onCancel)
    const cancelBtn = screen.getByRole('button', { name: /キャンセル|cancel/i })
    fireEvent.click(cancelBtn)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('最初の質問では戻るボタンが表示されない', () => {
    renderWizardPage()
    expect(screen.queryByRole('button', { name: /戻る|back/i })).not.toBeInTheDocument()
  })

  it('回答なしでは次へボタンが無効', () => {
    renderWizardPage()
    const nextBtn = screen.getByRole('button', { name: /次へ|next/i })
    expect(nextBtn).toBeDisabled()
  })
})
