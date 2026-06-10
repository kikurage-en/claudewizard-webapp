import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  lang: Lang
}

export function ConsentCheckbox({ checked, onChange, lang }: Props) {
  const { t } = useTranslation()

  // consent_label（例: "利用規約に同意してダウンロードする"）の中の
  // legal.consent_text（例: "利用規約"）の位置を見つけ、その箇所だけをリンク化する。
  // 文中のどこにリンク語が来ても（ja=先頭 / en=語中）正しい語順で組み立てる。
  const label = t('result.consent_label')
  const linkText = t('legal.consent_text')
  const idx = label.indexOf(linkText)
  const before = idx >= 0 ? label.slice(0, idx) : label
  const after = idx >= 0 ? label.slice(idx + linkText.length) : ''

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-orange flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange"
        aria-label={label}
      />
      <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
        {before}
        {idx >= 0 && (
          <a
            href={`#/${lang}/terms`}
            className="text-orange underline hover:text-orange-hover"
            target="_blank"
            rel="noopener noreferrer"
            // リンク（利用規約）クリックで親 label のチェック切り替えを誘発させない（誤トグル防止）
            onClick={(e) => e.stopPropagation()}
          >
            {linkText}
          </a>
        )}
        {after}
      </span>
    </label>
  )
}
