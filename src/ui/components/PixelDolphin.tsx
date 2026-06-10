import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// ピクセルアートのイルカマスコット。
// デザイン正: .claude/plans/design_handoff_claudewizard/design/mascot.jsx の移植。
// 18×18 グリッド。尾びれフレーム（A ↔ B）に胸びれオーバーレイ（down / up）を
// 描画時に合成することで、尾びれと胸びれの動きを独立させている。

const DOLPHIN_PALETTE: Record<string, string> = {
  O: '#D97C5F', // 本体
  D: '#D97C5F', // 旧アウトライン色（本体色に統合済み）
  H: '#F5C8A0', // 腹のハイライト
  E: '#0B0B0B', // 目
}

// フレーム A — 尾びれ中立
const DOLPHIN_FRAME_A = [
  '..................',
  '..................',
  '..................',
  '.....DDDD.........',
  '....OOOOODDD..DDD.',
  '...OOOOOOOOODDDD..',
  '..DOOEOOOOOOODD...',
  '.DDOOOOOOOOOOOD...',
  '.HHHHHHOOOOOOOOD..',
  '......HHDOHOOOOD..',
  '........DDHHOOOD..',
  '.........D..HOOD..',
  '.............OOD..',
  '............HOD...',
  '..........HHOOD...',
  '..........HHDD....',
  '............HD....',
  '.............H....',
]

// フレーム B — 尾びれ上げ
const DOLPHIN_FRAME_B = [
  '..................',
  '..................',
  '..................',
  '.....DDDD.........',
  '....OOOOODDD..DDD.',
  '...OOOOOOOOODDDD..',
  '..DOOEOOOOOOODD...',
  '.DDOOOOOOOOOOOD...',
  '.HHHHHHOOOOOOOOD..',
  '......HHDOHOOOOD..',
  '........DDHHOOOD..',
  '.........D..HOOD..',
  '.............OOD..',
  '..........HH.OD...',
  '..........HHDODD..',
  '............HDDH..',
  '.............HH...',
  '..................',
]

type Overlay = ReadonlyArray<readonly [number, number, string]>

// 胸びれ down — 腹の下にひれが垂れた状態（ベーススプライト準拠）
const PECTORAL_DOWN: Overlay = [
  [9, 8, 'D'],
  [10, 8, 'D'],
  [10, 9, 'D'],
  [11, 9, 'D'],
]

// 胸びれ up — ひれを体に畳んだ状態。
// 付け根（row 9）は腹の輪郭線上にあるため belly-cream で輪郭を閉じ、
// 腹より下に出ていた部分（row 10-11）は透明にしてシルエットを保つ。
const PECTORAL_UP: Overlay = [
  [9, 8, 'H'],
  [10, 8, '.'],
  [10, 9, '.'],
  [11, 9, '.'],
]

function applyOverlay(base: string[], overlay: Overlay): string[] {
  const rows = base.map((r) => r.split(''))
  for (const [y, x, ch] of overlay) {
    if (y >= 0 && y < rows.length && x >= 0 && x < rows[y].length) {
      rows[y][x] = ch
    }
  }
  return rows.map((r) => r.join(''))
}

type Props = {
  size?: number
  animate?: boolean
  className?: string
  style?: CSSProperties
}

export function PixelDolphin({ size = 120, animate = true, className, style }: Props) {
  const reduced = useReducedMotion()
  const shouldAnimate = animate && !reduced

  const [frame, setFrame] = useState(0)
  const [finUp, setFinUp] = useState(false)
  // 身体モーションは React state にせず <g> の transform 属性を直接更新する
  // （60fps の setState は再レンダリング負荷が大きく、実測で FCP/styleLayout を悪化させた）
  const gRef = useRef<SVGGElement>(null)
  // インスタンス毎の位相オフセット（複数配置時にスピンが同期しないように）
  const spinOffsetRef = useRef(Math.random() * 10)

  // 尾びれフラップ: 不規則なタイミング（ランダム位相で複数インスタンスを非同期化）
  useEffect(() => {
    if (!shouldAnimate) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const phase = Math.random() * 120

    const tick = () => {
      if (stopped) return
      setFrame((f) => 1 - f)
      const r = Math.random()
      let dur: number
      if (r < 0.12) dur = 380 + Math.random() * 270 // 長いポーズ
      else if (r < 0.22) dur = 90 + Math.random() * 40 // クイックダブル
      else dur = 150 + Math.random() * 90 // 通常
      timer = setTimeout(tick, dur)
    }

    timer = setTimeout(tick, phase + 120)
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [shouldAnimate])

  // 身体モーション（呼吸ボブ + 揺れ + 傾き + フルスピン）: rAF で <g> の transform を直接更新。
  // React の再レンダリングを伴わないため毎フレームでもコストは setAttribute 1 回分のみ。
  useEffect(() => {
    if (!shouldAnimate) return
    let raf: number
    let start: number | undefined
    const cx = 18 / 2
    const cy = 18 / 2
    const SPIN_PERIOD = 10 // スピン間隔（秒）
    const SPIN_DUR = 0.9 // 1 回転にかける時間（秒）

    const loop = (now: number) => {
      if (start === undefined) start = now
      const t = (now - start) / 1000
      const bob = Math.sin(t * 1.6) * 0.9 // ±0.9 px
      const sway = Math.sin(t * 0.9 + 1.3) * 0.5 // ±0.5 px
      const tilt = Math.sin(t * 1.6 - 0.6) * 3.0 // ±3 deg

      // フルスピン: 約 10 秒に 1 回、~900ms で 360°（ease-in-out cubic）
      const phase = (t + spinOffsetRef.current) % SPIN_PERIOD
      let spin = 0
      if (phase < SPIN_DUR) {
        const p = phase / SPIN_DUR
        spin = (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2) * 360
      }

      gRef.current?.setAttribute('transform', `translate(${sway} ${bob}) rotate(${tilt + spin} ${cx} ${cy})`)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      // 停止時は中立ポーズへ戻す（reduced-motion 切替時に傾いたまま残らない）
      gRef.current?.removeAttribute('transform')
    }
  }, [shouldAnimate])

  // 胸びれトグル: 尾びれよりゆっくり・不規則。基本は down、時々短く up。
  useEffect(() => {
    if (!shouldAnimate) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    let up = false
    const loop = () => {
      if (stopped) return
      up = !up
      setFinUp(up)
      const r = Math.random()
      let d: number
      if (up) {
        // up の保持時間 — 常に短く、構えたままにはしない
        if (r < 0.2) d = 180 + Math.random() * 180
        else d = 400 + Math.random() * 500
      } else {
        // down の保持時間（次のリフトまでの休憩）
        if (r < 0.15) d = 350 + Math.random() * 350
        else if (r < 0.3) d = 4500 + Math.random() * 3500
        else d = 1800 + Math.random() * 2200
      }
      timer = setTimeout(loop, d)
    }
    // ランダム遅延で開始しインスタンス間を非同期化
    timer = setTimeout(loop, 600 + Math.random() * 1500)
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [shouldAnimate])

  const baseSprite = frame === 0 ? DOLPHIN_FRAME_A : DOLPHIN_FRAME_B
  const sprite = applyOverlay(baseSprite, finUp ? PECTORAL_UP : PECTORAL_DOWN)
  const cols = 18
  const rows = 18

  const rects = []
  for (let y = 0; y < rows; y++) {
    const line = sprite[y]
    for (let x = 0; x < cols; x++) {
      const ch = line[x]
      if (ch === '.' || !DOLPHIN_PALETTE[ch]) continue
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={DOLPHIN_PALETTE[ch]} />)
    }
  }

  // ボブ/傾き/スピンでクリップしないよう viewBox に余白を持たせる
  // （18×18 を回転すると ~26×26。pad=5 で 28×28 の安全マージン）
  const pad = 5
  const vbW = cols + pad * 2
  const vbH = rows + pad * 2

  return (
    <svg
      width={size}
      height={(size * vbH) / vbW}
      viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`}
      className={className}
      style={{ shapeRendering: 'crispEdges', display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
      focusable="false"
    >
      {/* transform は rAF が直接管理（JSX で指定すると frame 再レンダリング毎に上書きされるため指定しない） */}
      <g ref={gRef}>{rects}</g>
    </svg>
  )
}
