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
        'w-full flex items-center gap-4 p-4 rounded-lg border-[1.5px] text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange',
        selected
          ? 'border-orange shadow-[3px_3px_0_#D97757] bg-cream-peach'
          : 'border-line-faint bg-white hover:border-line-strong hover:shadow-sm',
      ].join(' ')}
      aria-pressed={selected}
    >
      <span className={[
        'w-8 h-8 flex items-center justify-center rounded font-mono text-xs font-bold flex-shrink-0 transition-colors',
        selected ? 'bg-orange text-white' : 'bg-cream text-ink-muted border border-line-faint',
      ].join(' ')}>
        {shortcut}
      </span>
      <span className="text-sm text-ink">{label}</span>
      {selected && (
        <span className="ml-auto text-orange" aria-hidden="true">✓</span>
      )}
    </button>
  )
}
