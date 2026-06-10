import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../components/Footer'
import { LanguageProvider } from '../../i18n/context'
import { GITHUB_REPO_URL } from '../links'
import type { Lang } from '../../i18n/types'

function renderFooter(lang: Lang = 'ja') {
  return render(
    <LanguageProvider lang={lang}>
      <Footer lang={lang} />
    </LanguageProvider>
  )
}

describe('Footer', () => {
  it('利用規約・プライバシーポリシーへのリンクが言語付きで表示される', () => {
    renderFooter('ja')
    expect(screen.getByRole('link', { name: '利用規約' })).toHaveAttribute('href', '#/ja/terms')
    expect(screen.getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '#/ja/privacy')
  })

  it('GitHub リンクが公開リポジトリの実 URL を指す', () => {
    renderFooter('ja')
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', GITHUB_REPO_URL)
  })

  it('タグラインが英語ロケールで英語になる（ハードコード日本語が残らない）', () => {
    renderFooter('en')
    expect(screen.getByText('Claude Code config file generation wizard')).toBeInTheDocument()
    expect(screen.queryByText('Claude Code 設定ファイル生成ウィザード')).not.toBeInTheDocument()
  })
})
