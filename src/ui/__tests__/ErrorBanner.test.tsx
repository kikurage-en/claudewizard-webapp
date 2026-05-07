import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBanner, type ErrorCode } from '../components/ErrorBanner'
import { LanguageProvider } from '../../i18n/context'

function renderBanner(code: ErrorCode, onRetry?: () => void, onDismiss?: () => void) {
  return render(
    <LanguageProvider lang="ja">
      <ErrorBanner code={code} onRetry={onRetry} onDismiss={onDismiss} />
    </LanguageProvider>
  )
}

describe('ErrorBanner', () => {
  it('認証エラーは user_action 分類で表示される', () => {
    renderBanner('auth')
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-category', 'user_action')
    expect(banner).toHaveAttribute('data-code', 'auth')
    expect(screen.getByText(/APIキーが無効/)).toBeInTheDocument()
  })

  it('レート制限は auto_recovery 分類で表示される', () => {
    renderBanner('rate_limit')
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-category', 'auto_recovery')
  })

  it('サーバーエラーは auto_recovery 分類で表示される', () => {
    renderBanner('server')
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-category', 'auto_recovery')
  })

  it('タイムアウトは user_action 分類で表示される', () => {
    renderBanner('timeout')
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-category', 'user_action')
  })

  it('CORS エラーは fatal 分類で表示される', () => {
    renderBanner('cors')
    const banner = screen.getByTestId('error-banner')
    expect(banner).toHaveAttribute('data-category', 'fatal')
  })

  it('再試行ボタンは fatal 以外で表示される', () => {
    const onRetry = vi.fn()
    renderBanner('auth', onRetry)
    const retryButton = screen.getByRole('button', { name: /再試行/ })
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('再試行ボタンは fatal 分類では非表示', () => {
    renderBanner('cors', vi.fn())
    expect(screen.queryByRole('button', { name: /再試行/ })).not.toBeInTheDocument()
  })

  it('閉じるボタンは onDismiss が指定されている場合に表示される', () => {
    const onDismiss = vi.fn()
    renderBanner('auth', undefined, onDismiss)
    const closeButton = screen.getByRole('button', { name: /閉じる/ })
    fireEvent.click(closeButton)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('role="alert" でアクセシブルに通知される', () => {
    renderBanner('auth')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
