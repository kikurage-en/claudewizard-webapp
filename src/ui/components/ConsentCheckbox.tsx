import { useTranslation } from '../../i18n/useTranslation'
import type { Lang } from '../../i18n/types'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  lang: Lang
}

export function ConsentCheckbox({ checked, onChange, lang }: Props) {
  const { t } = useTranslation()

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-orange flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange"
        aria-label={t('result.consent_label')}
      />
      <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
        {t('result.consent_label').replace(t('legal.consent_text'), '')}
        <a
          href={`#/${lang}/terms`}
          className="text-orange underline hover:text-orange-dark"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('legal.consent_text')}
        </a>
        {t('result.consent_label').includes(t('legal.consent_text'))
          ? ''
          : t('result.consent_label').split(t('legal.consent_text'))[1]}
      </span>
    </label>
  )
}
