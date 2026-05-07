import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiKeyPage } from '../pages/ApiKeyPage'
import { LanguageProvider } from '../../i18n/context'
import { getApiKey, clearApiKey } from '../../security/sessionStore'

vi.mock('../../analytics/events', () => ({
  trackEvent: vi.fn(),
}))

function renderApiKeyPage(onContinue = vi.fn(), onCancel = vi.fn()) {
  return render(
    <LanguageProvider lang="ja">
      <ApiKeyPage lang="ja" plan="light" onContinue={onContinue} onCancel={onCancel} />
    </LanguageProvider>
  )
}

describe('ApiKeyPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('タイトルが表示される', () => {
    renderApiKeyPage()
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('APIキー入力欄が表示される', () => {
    renderApiKeyPage()
    expect(screen.getByLabelText(/Anthropic API キー/)).toBeInTheDocument()
  })

  it('APIキー注記が表示される', () => {
    renderApiKeyPage()
    expect(screen.getByText(/セッション内のみで保持/)).toBeInTheDocument()
  })

  it('sk-ant- で始まらないキーではボタンが無効', () => {
    renderApiKeyPage()
    const input = screen.getByLabelText(/Anthropic API キー/)
    fireEvent.change(input, { target: { value: 'invalid-key' } })
    const btn = screen.getByRole('button', { name: /ウィザードを始める/ })
    expect(btn).toBeDisabled()
  })

  it('有効なキー入力でボタンが有効になる', () => {
    renderApiKeyPage()
    const input = screen.getByLabelText(/Anthropic API キー/)
    fireEvent.change(input, { target: { value: 'sk-ant-api03-test' } })
    const btn = screen.getByRole('button', { name: /ウィザードを始める/ })
    expect(btn).not.toBeDisabled()
  })

  it('送信後にsessionStorageにキーが保存される', () => {
    renderApiKeyPage()
    const input = screen.getByLabelText(/Anthropic API キー/)
    fireEvent.change(input, { target: { value: 'sk-ant-api03-test' } })
    fireEvent.submit(screen.getByRole('button', { name: /ウィザードを始める/ }).closest('form')!)
    expect(getApiKey()).toBe('sk-ant-api03-test')
  })

  it('送信後にonContinueが呼ばれる', () => {
    const onContinue = vi.fn()
    renderApiKeyPage(onContinue)
    const input = screen.getByLabelText(/Anthropic API キー/)
    fireEvent.change(input, { target: { value: 'sk-ant-api03-test' } })
    fireEvent.submit(screen.getByRole('button', { name: /ウィザードを始める/ }).closest('form')!)
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('キャンセルボタンでonCancelが呼ばれる', () => {
    const onCancel = vi.fn()
    renderApiKeyPage(vi.fn(), onCancel)
    fireEvent.click(screen.getByRole('button', { name: /戻る/ }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('表示トグルボタンが動作する', () => {
    renderApiKeyPage()
    const toggleBtn = screen.getByRole('button', { name: /表示/ })
    expect(toggleBtn).toBeInTheDocument()
    fireEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /非表示/ })).toBeInTheDocument()
  })

  it('Anthropic Console リンクが存在する', () => {
    renderApiKeyPage()
    const link = screen.getByRole('link', { name: /APIキーを取得/ })
    expect(link).toHaveAttribute('href', 'https://console.anthropic.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  afterEach(() => {
    clearApiKey()
  })
})
