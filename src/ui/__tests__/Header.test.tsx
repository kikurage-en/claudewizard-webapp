import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../components/Header'
import { LanguageProvider } from '../../i18n/context'
import { GITHUB_REPO_URL } from '../links'
import type { Lang } from '../../i18n/types'

function renderHeader(lang: Lang = 'ja') {
  return render(
    <LanguageProvider lang={lang}>
      <Header lang={lang} onLanguageChange={vi.fn()} />
    </LanguageProvider>
  )
}

describe('Header', () => {
  it('GitHub リンクが公開リポジトリの実 URL を指す（死にリンク禁止）', () => {
    renderHeader('ja')
    const links = screen.getAllByRole('link', { name: /GitHub/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', GITHUB_REPO_URL)
    }
  })

  it('未実装のガイドページへのリンクは表示しない', () => {
    renderHeader('ja')
    expect(screen.queryByRole('link', { name: '使い方' })).not.toBeInTheDocument()
  })

  it('ナビゲーションの aria-label が日本語ロケールで日本語になる', () => {
    renderHeader('ja')
    expect(screen.getByRole('navigation', { name: 'メインナビゲーション' })).toBeInTheDocument()
  })

  it('言語切替ボタンの aria-label がロケール経由で解決される', () => {
    renderHeader('ja')
    expect(screen.getByRole('button', { name: '英語に切り替え' })).toBeInTheDocument()
  })

  it('英語ロケールでは aria-label も英語になる', () => {
    renderHeader('en')
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Japanese' })).toBeInTheDocument()
  })
})
