import { test, expect } from '@playwright/test'
import JSZip from 'jszip'

test.describe('Free プラン完走フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/ja/')
  })

  test('トップページが表示される', async ({ page }) => {
    await expect(page.getByText('フリー', { exact: true })).toBeVisible()
    await expect(page.getByText('ライト', { exact: true })).toBeVisible()
    await expect(page.getByText('プラス', { exact: true })).toBeVisible()
  })

  test('Free プランを選択するとウィザードに遷移する', async ({ page }) => {
    const freeCard = page.getByRole('button', { name: /フリー/ })
    await freeCard.click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)
    // Free は再設計で 3 問（分野・名前・言語）
    await expect(page.getByText(/質問 1 \/ 3/)).toBeVisible()
  })

  test('Q1〜Q3を回答して完了画面に到達する', async ({ page }) => {
    const freeCard = page.getByRole('button', { name: /フリー/ })
    await freeCard.click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)

    // Q1: 分野を選択（最初の選択肢）
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // Q2: プロジェクト名を入力
    await page.getByRole('textbox').fill('TestProject')
    await page.getByRole('button', { name: /次へ/i }).click()

    // Q3: 言語を選択（最後の質問 → 生成 → 完了）
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    await expect(page).toHaveURL(/#\/ja\/complete/, { timeout: 15000 })
    await expect(page.getByText('CLAUDE.md')).toBeVisible()
  })

  test('同意チェックなしではダウンロードボタンが無効', async ({ page }) => {
    await page.getByRole('button', { name: /フリー/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)

    // Q1
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()
    // Q2
    await page.getByRole('textbox').fill('TestProject')
    await page.getByRole('button', { name: /次へ/i }).click()
    // Q3 (最後)
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    await expect(page).toHaveURL(/#\/ja\/complete/, { timeout: 15000 })

    const downloadBtn = page.getByRole('button', { name: /ダウンロード/i })
    await expect(downloadBtn).toBeDisabled()
  })

  test('同意チェック後にZIPダウンロードが可能（4ファイル）', async ({ page }) => {
    await page.getByRole('button', { name: /フリー/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)

    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()
    await page.getByRole('textbox').fill('TestProject')
    await page.getByRole('button', { name: /次へ/i }).click()
    // Q3: 言語（最初の選択肢 = TypeScript / JavaScript）
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    await expect(page).toHaveURL(/#\/ja\/complete/, { timeout: 15000 })

    await page.getByRole('checkbox').click()
    const downloadBtn = page.getByRole('button', { name: /ダウンロード/i })
    await expect(downloadBtn).not.toBeDisabled()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click(),
    ])

    const path = await download.path()
    expect(path).toBeTruthy()

    const buffer = await download.createReadStream().then(
      (stream) =>
        new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = []
          stream.on('data', (chunk: Buffer) => chunks.push(chunk))
          stream.on('end', () => resolve(Buffer.concat(chunks)))
          stream.on('error', reject)
        })
    )

    const zip = await JSZip.loadAsync(buffer)
    expect(zip.files['CLAUDE.md']).toBeTruthy()
    expect(zip.files['README.md']).toBeTruthy()
    expect(zip.files['.claude/skills/main/SKILL.md']).toBeTruthy()
    expect(zip.files['.claude/rules/security-guidelines.md']).toBeTruthy()
    const fileEntries = Object.values(zip.files).filter((f) => !f.dir)
    expect(fileEntries.length).toBe(4)

    // 接地検証: 生成 CLAUDE.md に記入指示が残っておらず、stack（TypeScript）が実値化されている
    const claudeMd = await zip.files['CLAUDE.md'].async('string')
    expect(claudeMd).toContain('TestProject')
    expect(claudeMd).not.toMatch(/書く。|に置き換える/)
    expect(claudeMd).toContain('TypeScript') // 最初の言語選択肢の実値化
  })

  test('戻るボタンで前の質問に戻れる', async ({ page }) => {
    await page.getByRole('button', { name: /フリー/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)

    // Q1を回答
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // Q2に移動した後、戻るボタンが表示される
    await expect(page.getByText(/質問 2 \/ 3/)).toBeVisible()
    await expect(page.getByRole('button', { name: /戻る/i })).toBeVisible()

    // 戻るをクリック
    await page.getByRole('button', { name: /戻る/i }).click()
    await expect(page.getByText(/質問 1 \/ 3/)).toBeVisible()
  })
})
