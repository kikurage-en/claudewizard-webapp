import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardPage } from '../pages/WizardPage'
import { WizardProvider } from '../../wizard/WizardProvider'
import { LanguageProvider } from '../../i18n/context'
import { generate } from '../../generator/generate'

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
    expect(screen.getByText(/質問 1 \/ 3/)).toBeInTheDocument()
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

  it('Free: 全質問完了で次へを押しても generate(自動DL)せず onComplete が呼ばれる（同意前DL防止・FR-4）', () => {
    const onComplete = vi.fn()
    renderWizardPage(onComplete)
    const next = () => screen.getByRole('button', { name: /次へ|next/i })
    // Q1: 分野（choice）を選択 → 次へ
    fireEvent.click(document.querySelectorAll('button[aria-pressed]')[0])
    fireEvent.click(next())
    // Q2: プロジェクト名（text）を入力 → 次へ
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my-proj' } })
    fireEvent.click(next())
    // Q3: 言語（choice・最後）を選択 → 次へ
    fireEvent.click(document.querySelectorAll('button[aria-pressed]')[0])
    fireEvent.click(next())
    // Free は WizardPage で生成・DL せず、CompletePage で同意後に行う
    expect(vi.mocked(generate)).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('IME 変換確定の Enter（isComposing）では次へ進まない（日本語入力対応）', () => {
    renderWizardPage()
    // Q1 choice 選択 → 次へ → Q2(text) へ
    fireEvent.click(document.querySelectorAll('button[aria-pressed]')[0])
    fireEvent.click(screen.getByRole('button', { name: /次へ|next/i }))
    expect(screen.getByText(/質問 2 \/ 3/)).toBeInTheDocument()
    // IME 変換確定の Enter は「次へ」扱いにしない → Q2 のまま遷移しない
    fireEvent.keyDown(window, { key: 'Enter', isComposing: true })
    expect(screen.getByText(/質問 2 \/ 3/)).toBeInTheDocument()
  })
})
