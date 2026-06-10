import { test, expect } from '@playwright/test'
import JSZip from 'jszip'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

test.describe('Light プラン完走フロー（実 API キー使用）', () => {
  test.skip(!ANTHROPIC_API_KEY, 'ANTHROPIC_API_KEY が未設定のためスキップ')

  // Claude API 実呼び出しのため十分なタイムアウトを確保
  test.setTimeout(120_000)

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/ja/')
  })

  test('Light を選んで ApiKey 画面に遷移し、Q1-Q6 を回答して 6 ファイル ZIP を取得', async ({ page }) => {
    // 1. Light プランを選択
    const lightCard = page.getByRole('button', { name: /ライト/ })
    await expect(lightCard).toHaveAttribute('aria-disabled', 'false')
    await lightCard.click()

    // 2. ApiKeyPage で API キーを入力
    await expect(page).toHaveURL(/#\/ja\/api-key/)
    const apiKeyInput = page.getByLabel(/API\s?キー/, { exact: false }).first()
    await apiKeyInput.fill(ANTHROPIC_API_KEY)
    // 注記が表示されることを確認（FR-5）
    await expect(page.getByText(/サーバーには送信されません/)).toBeVisible()

    // ウィザード開始
    await page.getByRole('button', { name: /ウィザードを始める/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)

    // 3. Q1: 分野（最初の選択肢）
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // 4. Q2: プロジェクト名
    await page.getByRole('textbox').fill('LightTestProject')
    await page.getByRole('button', { name: /次へ/i }).click()

    // 5. Q3: 作業内容
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // 6. Q4: 使用ツール
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // 7. Q5: 目標
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /次へ/i }).click()

    // 8. Q6: 備考・要望（任意。空のまま進める）→ 完了画面へ（統一フロー: ここでは生成しない）
    await page.getByRole('button', { name: /次へ/i }).click()
    await expect(page).toHaveURL(/#\/ja\/complete/, { timeout: 10_000 })

    // 9. 利用規約に同意 → ダウンロードボタンで生成（API）+ DL（同意なし自動DLを防ぐ統一フロー）
    await page.getByRole('checkbox').click()
    const downloadPromise = page.waitForEvent('download', { timeout: 100_000 })
    await page.getByRole('button', { name: /ダウンロード/i }).click()

    // 10. 生成中ローディング（DownloadButton の loading 表示）
    await expect(page.getByText(/生成中/)).toBeVisible({ timeout: 5_000 })

    // 11. ZIP ダウンロード
    const download = await downloadPromise
    const path = await download.path()
    expect(path).toBeTruthy()

    // 11. ZIP の中身を検証（6ファイル）
    const fs = await import('node:fs/promises')
    const buffer = await fs.readFile(path!)
    const zip = await JSZip.loadAsync(buffer)
    const entries = Object.keys(zip.files).filter((p) => !zip.files[p].dir)
    expect(entries).toContain('CLAUDE.md')
    expect(entries).toContain('README.md')
    expect(entries).toContain('.claude/skills/main/SKILL.md')
    expect(entries).toContain('.claude/rules/security-guidelines.md')
    expect(entries).toContain('.claude/rules/development-workflow.md')
    expect(entries).toContain('.claude/rules/core-principles.md')
    expect(entries.length).toBe(6)

    // 12. 生成内容にプロジェクト名が含まれている
    const claudeMd = await zip.file('CLAUDE.md')?.async('string')
    expect(claudeMd).toContain('LightTestProject')

    // 13. prompt 接地の出力構造を検証（adversarial review finding 2）
    //   生成 CLAUDE.md は 100 行以下・出荷 rules への @参照チェーンを含む（prompt 接地の実効を assert）
    expect(claudeMd!.split('\n').length).toBeLessThanOrEqual(100)
    expect(claudeMd).toContain('@.claude/rules/core-principles.md')
    expect(claudeMd).toContain('@.claude/rules/security-guidelines.md')
    expect(claudeMd).toContain('@.claude/rules/development-workflow.md')
    //   生成 SKILL.md は YAML frontmatter（name / description）を含む
    const skillMd = await zip.file('.claude/skills/main/SKILL.md')?.async('string')
    expect(skillMd?.startsWith('---')).toBe(true)
    expect(skillMd).toMatch(/name:/)
    expect(skillMd).toMatch(/description:/)
  })

  test('無効な API キー形式は送信できない（クライアント側バリデーション）', async ({ page }) => {
    const lightCard = page.getByRole('button', { name: /ライト/ })
    await lightCard.click()
    await expect(page).toHaveURL(/#\/ja\/api-key/)

    const apiKeyInput = page.getByLabel(/API\s?キー/, { exact: false }).first()
    await apiKeyInput.fill('invalid-key')

    // ApiKeyPage は sk-ant- で始まらないキーを isValid=false として送信不可にする
    const continueButton = page.getByRole('button', { name: /ウィザードを始める/ })
    await expect(continueButton).toBeDisabled()
  })
})
