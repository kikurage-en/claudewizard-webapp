type Props = {
  id: string
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onEnter?: () => void
  isValid?: boolean
}

export function TextInput({ id, label, value, placeholder, onChange, onEnter, isValid }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME 変換確定の Enter（日本語入力など）は「次へ」送信扱いにしない
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && onEnter) {
      e.preventDefault()
      onEnter()
    }
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-invalid={isValid === false || undefined}
        className={[
          'w-full px-4 py-3 rounded-btn border-[1.5px] font-mono text-sm bg-white text-ink',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange transition-colors',
          isValid === false ? 'border-danger' : 'border-line-faint focus:border-orange',
        ].join(' ')}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
