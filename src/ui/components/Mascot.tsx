import { PixelDolphin } from './PixelDolphin'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// デザイン仕様（ui-domain.md）: ウィザード 24-36px / ヒーロー周辺 36px / 完了画面 96px
const SIZE_MAP = { sm: 24, md: 36, lg: 96 }

// 装飾要素のためスクリーンリーダーには公開しない（aria-hidden）
export function Mascot({ size = 'md', className = '' }: Props) {
  return (
    <span aria-hidden="true" className={`inline-block select-none ${className}`}>
      <PixelDolphin size={SIZE_MAP[size]} />
    </span>
  )
}
