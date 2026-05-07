type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-7xl' }

export function Mascot({ size = 'md', className = '' }: Props) {
  return (
    <span
      role="img"
      aria-label="ClaudeWizard mascot dolphin"
      className={`inline-block select-none ${SIZE_MAP[size]} ${className}`}
    >
      🐬
    </span>
  )
}
