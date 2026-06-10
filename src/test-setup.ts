import '@testing-library/jest-dom'

// jsdom の matchMedia は環境により未実装/不完全。テストでは既定を
// 「prefers-reduced-motion: reduce にマッチ」とし、PixelDolphin 等の
// JS アニメーション（rAF / setTimeout）を止めて決定的にする。
// アニメーション挙動を検証するテストは window.matchMedia を個別に上書きする。
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
})
