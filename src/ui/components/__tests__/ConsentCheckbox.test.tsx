import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConsentCheckbox } from '../ConsentCheckbox'
import { LanguageProvider } from '../../../i18n/context'

function renderConsent(lang: 'ja' | 'en' = 'ja', checked = false) {
  const onChange = vi.fn()
  render(
    <LanguageProvider lang={lang}>
      <ConsentCheckbox checked={checked} onChange={onChange} lang={lang} />
    </LanguageProvider>
  )
  return onChange
}

describe('ConsentCheckbox', () => {
  it('ja: 同意文言が正しい語順で表示される（利用規約 → に同意する）', () => {
    renderConsent('ja')
    const label = document.querySelector('label')
    // 表示テキスト全体が consent_label と完全一致（語順崩れ・重複なし）
    expect(label?.textContent).toBe('利用規約に同意する')
    expect(label?.textContent).not.toContain('に同意する利用規約')
  })

  it('en: 同意文言が正しい語順で表示される（語中のリンクが正しい位置）', () => {
    renderConsent('en')
    const label = document.querySelector('label')
    expect(label?.textContent).toBe('I agree to the Terms of Service')
  })

  it('利用規約がリンクで、terms ページを別タブで指す', () => {
    renderConsent('ja')
    const link = screen.getByRole('link', { name: '利用規約' })
    expect(link.getAttribute('href')).toBe('#/ja/terms')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('チェックボックスのトグルで onChange(true) が呼ばれる', () => {
    const onChange = renderConsent('ja', false)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('利用規約リンクのクリックではチェック状態を変えない（誤トグル防止）', () => {
    const onChange = renderConsent('ja', false)
    fireEvent.click(screen.getByRole('link', { name: '利用規約' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
