import JSZip from 'jszip'

export type ZipFile = {
  path: string
  content: string
}

export async function buildZip(files: ZipFile[]): Promise<Blob> {
  const zip = new JSZip()
  for (const file of files) {
    zip.file(file.path, file.content)
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
