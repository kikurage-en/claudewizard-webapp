import { PixelDolphin } from './PixelDolphin'

type Props = {
  text?: string
  size?: number
  className?: string
}

// 画面コーナーのマスコット演出（final-variants.jsx の MascotCorner）。
// 装飾専用: aria-hidden + pointer-events-none で操作・読み上げを奪わない。
export function MascotCorner({ text, size = 96, className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      data-testid="mascot-corner"
      className={`pointer-events-none select-none fixed bottom-5 right-5 z-30 hidden md:flex items-end gap-3 ${className}`}
    >
      {text && (
        <div
          data-testid="mascot-bubble"
          className="relative bg-white border-2 border-ink rounded-[14px] px-3.5 py-2.5 text-[13px] font-medium text-ink shadow-offset-ink-sm mb-2"
        >
          {text}
          {/* 右向きテール（マスコット側へ） */}
          <span className="absolute -right-[7px] bottom-3 w-3 h-3 bg-white border-r-2 border-t-2 border-ink rotate-45" />
        </div>
      )}
      <PixelDolphin size={size} />
    </div>
  )
}
