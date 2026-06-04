import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildZip, downloadBlob } from '../zipBuilder'

describe('buildZip', () => {
  it('ファイル一覧からBlobを生成する', async () => {
    const files = [
      { path: 'CLAUDE.md', content: '# Project' },
      { path: 'README.md', content: '# README' },
    ]
    const blob = await buildZip(files)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('空のファイル一覧でも動作する', async () => {
    const blob = await buildZip([])
    expect(blob).toBeInstanceOf(Blob)
  })
})

describe('downloadBlob', () => {
  let clickSpy: ReturnType<typeof vi.fn>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let appendChildSpy: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let removeChildSpy: any

  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
    clickSpy = vi.fn()
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickSpy as unknown as () => void
      }
      return node
    })
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue({} as Node)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('Blob URLを生成してアンカータグをクリックする', () => {
    const blob = new Blob(['content'], { type: 'application/zip' })
    downloadBlob(blob, 'output.zip')

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(appendChildSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('ダウンロードファイル名が設定される', () => {
    const blob = new Blob(['content'], { type: 'application/zip' })
    let capturedAnchor: HTMLAnchorElement | null = null
    appendChildSpy.mockImplementation((node: Node) => {
      if (node instanceof HTMLAnchorElement) {
        node.click = clickSpy as unknown as () => void
        capturedAnchor = node
      }
      return node
    })

    downloadBlob(blob, 'my-project.zip')

    expect(capturedAnchor).not.toBeNull()
    expect(capturedAnchor!.download).toBe('my-project.zip')
  })
})
