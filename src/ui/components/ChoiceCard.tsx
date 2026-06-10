type Props = {
  label: string
  shortcut: string
  selected: boolean
  onClick: () => void
}

export function ChoiceCard({ label, shortcut, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-150 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange',
        selected
          ? // 選択時: オレンジ枠 + オフセット影 + 影の方向へ押し込まれた見え方（translate）
            'border-orange shadow-offset-orange bg-white -translate-x-px -translate-y-px'
          : 'border-line-faint shadow-offset-line bg-white hover:border-line-strong',
      ].join(' ')}
      aria-pressed={selected}
    >
      <span className={[
        'w-8 h-8 flex items-center justify-center rounded font-mono text-xs font-bold flex-shrink-0 transition-colors',
        selected ? 'bg-orange text-white' : 'bg-cream text-ink-muted border border-line-faint',
      ].join(' ')}>
        {shortcut}
      </span>
      <span className="text-sm text-ink flex-1">{label}</span>
      {/* 右上 20px チェックボックス（final-variants.jsx の選択フィードバック） */}
      <span
        data-testid="choice-check"
        data-checked={selected}
        aria-hidden="true"
        className={[
          'w-5 h-5 flex items-center justify-center rounded border-2 text-xs font-bold flex-shrink-0 transition-colors',
          selected ? 'bg-orange border-orange text-white' : 'border-line-faint bg-white text-transparent',
        ].join(' ')}
      >
        ✓
      </span>
    </button>
  )
}
