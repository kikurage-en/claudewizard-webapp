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
    // Q1 は 7 択 → 7 番目にもショートカットが割り当てられる（A-F 6 個では欠落する）
    expect(screen.getByText('G')).toBeInTheDocument()
  })

  it('選択肢を選ぶと次へボタンが有効になる', () => {
    renderWizardPage()
    const nextBtn = screen.getByRole('button', { name: /次へ|next/i })
    expect(nextBtn).toBeDisabled()
    const choices = screen.getAllByRole('button', { pressed: false })
    fireEvent.click(choices[0])
    expect(nextBtn).toBeEnabled()
  })

  it('質問遷移（次へ）でスクロール位置を最上部へリセットする（モバイルの位置引き継ぎ防止）', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo')
    renderWizardPage()
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[0])
    scrollSpy.mockClear() // マウント分を除外し、質問遷移起因のみ検証
    fireEvent.click(screen.getByRole('button', { name: /次へ|next/i }))
    expect(screen.getByText(/質問 2 \/ 3/)).toBeInTheDocument()
    expect(scrollSpy).toHaveBeenCalledWith(0, 0)
    scrollSpy.mockRestore()
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

  it('CTA フッターがモバイルで sticky になる構造を持つ', () => {
    renderWizardPage()
    const footer = screen.getByTestId('wizard-cta-footer')
    expect(footer.className).toContain('sticky')
    expect(footer.className).toContain('bottom-0')
  })

  it('キーヒント（ESC で中断 · ⏎ で次へ）が表示される', () => {
    renderWizardPage()
    expect(screen.getByText('ESC で中断 · ⏎ で次へ')).toBeInTheDocument()
  })

  it('Escape キーで中断（onCancel）できる', () => {
    const onCancel = vi.fn()
    renderWizardPage(vi.fn(), onCancel)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('コーナーマスコットが進捗の吹き出しを表示する（最終問はラスト表記）', () => {
    renderWizardPage()
    // Q1: free は 3 問 → 残り 2 問
    expect(screen.getByText('1問目、あと2問です！')).toBeInTheDocument()
    // Q3（最終問）まで進める
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[0])
    fireEvent.click(screen.getByRole('button', { name: /次へ|next/i }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'proj' } })
    fireEvent.click(screen.getByRole('button', { name: /次へ|next/i }))
    expect(screen.getByText('ラストの質問です！')).toBeInTheDocument()
  })

  it('質問エリアに遷移アニメーションのフックが付く', () => {
    renderWizardPage()
    expect(screen.getByTestId('question-area').className).toContain('animate-fade-in')
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
