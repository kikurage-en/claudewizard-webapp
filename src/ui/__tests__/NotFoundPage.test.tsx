import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LanguageProvider } from '../../i18n/context'
import type { Lang } from '../../i18n/types'

function renderPage(lang: Lang) {
  return render(
    <LanguageProvider lang={lang}>
      <NotFoundPage />
    </LanguageProvider>
  )
}

describe('NotFoundPage', () => {
  it('日本語ロケールで日本語の案内が表示される', () => {
    renderPage('ja')
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('ページが見つかりませんでした。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })

  it('英語ロケールで英語の案内が表示される（ハードコード日本語が残らない）', () => {
    renderPage('en')
    expect(screen.getByText('Page not found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument()
    expect(screen.queryByText('ページが見つかりませんでした。')).not.toBeInTheDocument()
  })
})
