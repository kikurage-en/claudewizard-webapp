import { Mascot } from '../components/Mascot'

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <Mascot size="lg" className="mb-6 opacity-50" />
      <h1 className="font-display font-black text-4xl text-ink mb-4">404</h1>
      <p className="text-ink-muted mb-8">ページが見つかりませんでした。</p>
      <a href="#/" className="btn-primary px-6 py-2">
        ホームへ戻る
      </a>
    </main>
  )
}
