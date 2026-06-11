import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// モバイル（iPhone 12 / WebKit = 実機報告の iPhone Safari 相当）の横はみ出し回帰テスト。
//
// 合否判定の核は「要素単位の検査」であり、scrollWidth 単独には依存しない:
// html/body に overflow-x: clip ガードを置くと document の scrollWidth は常に
// viewport 以下になり症状は消えるが、真因要素（はみ出す要素・折り返せない内容）は
// 残りうる。そのためガードの有無に左右されない 2 つの要素検査で真因を検出する:
//   (a) border-box 検査: 可視要素の rect がビューポート水平範囲に収まる
//   (b) 内容あふれ検査: overflow-x: visible の要素で scrollWidth > clientWidth に
//       なっていない（長い URL / パス等が折り返されず内容が箱からあふれるケース）
// スクリーンショットは目視確認の補助であり、合否判定には使わない。

const SHOT_DIR = process.env.MOBILE_SHOT_DIR || join('e2e', 'screenshots', 'mobile')

type Offender = {
  kind: 'rect' | 'content'
  tag: string
  cls: string
  detail: string
}

type OverflowState = {
  viewportWidth: number
  scrollWidth: number
  offenders: Offender[]
}

async function getOverflowState(page: Page): Promise<OverflowState> {
  // 行折返し・幅はフォントメトリクス依存のため、Web フォントのロード完了を待つ
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const TOLERANCE = 1 // サブピクセル丸めの許容
    const offenders: Array<{ kind: 'rect' | 'content'; tag: string; cls: string; detail: string }> = []
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      const tag = el.tagName.toLowerCase()
      const cls = (el.getAttribute('class') ?? '').slice(0, 100)
      if (rect.right > vw + TOLERANCE || rect.left < -TOLERANCE) {
        offenders.push({
          kind: 'rect',
          tag,
          cls,
          detail: `left=${rect.left.toFixed(1)} right=${rect.right.toFixed(1)} vw=${vw}`,
        })
      }
      // input/textarea/select は内部スクロールが正規挙動のため内容あふれ検査から除外
      if (
        style.overflowX === 'visible' &&
        !['input', 'textarea', 'select'].includes(tag) &&
        el.scrollWidth > el.clientWidth + TOLERANCE
      ) {
        offenders.push({
          kind: 'content',
          tag,
          cls,
          detail: `scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth}`,
        })
      }
    }
    return { viewportWidth: vw, scrollWidth: document.documentElement.scrollWidth, offenders }
  })
}

async function assertNoHorizontalOverflow(page: Page, shotName: string) {
  const state = await getOverflowState(page)
  mkdirSync(SHOT_DIR, { recursive: true })
  // 2 プロジェクト（390/375）でファイル名が衝突しないよう幅を含める
  await page.screenshot({ path: join(SHOT_DIR, `${shotName}-w${state.viewportWidth}.png`), fullPage: true })
  expect(
    state.offenders,
    `横はみ出し要素あり:\n${JSON.stringify(state.offenders, null, 2)}`
  ).toEqual([])
  // 補助検査（ガード未適用環境での症状そのもの）
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1)
}

// iOS Safari 実機は font-size < 16px の入力欄へのフォーカスでページを自動ズームし、
// ズーム後にページ幅がビューポートを超える（実機でのみ再現する既知挙動。
// エミュレーションでは再現しないため、発火条件そのものを deterministic に検査する）
async function assertNoIosFocusZoom(page: Page, inputSelector: string) {
  const fontSize = await page
    .locator(inputSelector)
    .evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize))
  expect(fontSize, `入力欄 font-size ${fontSize}px < 16px は iOS Safari の自動ズームを発火させる`).toBeGreaterThanOrEqual(16)
}

// 質問遷移アニメーション（wizard-fade-in）中の一時的なはみ出しを rAF で最大値サンプリングする。
// 計測はガードの影響を受けない要素 rect の最大 right + scrollWidth の両方を追跡。
async function startOverflowSampling(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __cwMaxRight: number; __cwSampling: boolean }
    w.__cwMaxRight = 0
    w.__cwSampling = true
    const tick = () => {
      if (!w.__cwSampling) return
      let max = 0
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const r = el.getBoundingClientRect()
        if (r.width > 0) max = Math.max(max, r.right)
      }
      w.__cwMaxRight = Math.max(w.__cwMaxRight, max, document.documentElement.scrollWidth)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

async function stopOverflowSampling(page: Page): Promise<number> {
  return page.evaluate(() => {
    const w = window as unknown as { __cwMaxRight: number; __cwSampling: boolean }
    w.__cwSampling = false
    return w.__cwMaxRight
  })
}

// H1 の実レンダリング行数（折返し崩れの deterministic 検出。
// hero タイトルは \n 2 つ = 意図 3 行。途中折返しが起きると 4 行以上になる）
async function countH1Lines(page: Page): Promise<number> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  return page.locator('h1').evaluate((el) => {
    const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight)
    return Math.round(el.getBoundingClientRect().height / lineHeight)
  })
}

// Free プランで Q1〜Q3 を回答する（無課金経路。free-flow.spec.ts と同じ操作パターン）
async function answerFreeWizard(page: Page) {
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: /次へ/i }).click()
  await page.getByRole('textbox').fill('MobileTest')
  await page.getByRole('button', { name: /次へ/i }).click()
  await page.locator('button[aria-pressed]').first().click()
  await page.getByRole('button', { name: /次へ/i }).click()
}

test.describe('モバイル横はみ出し回帰（iPhone 12 相当）', () => {
  test('トップ（ja）: はみ出しなし + H1 が意図どおり 3 行', async ({ page }) => {
    await page.goto('/#/ja/')
    await assertNoHorizontalOverflow(page, 'top-ja')
    expect(await countH1Lines(page), 'ja H1 の途中折返し').toBe(3)
  })

  test('トップ（en）: はみ出しなし + H1 が意図どおり 3 行', async ({ page }) => {
    await page.goto('/#/en/')
    await assertNoHorizontalOverflow(page, 'top-en')
    expect(await countH1Lines(page), 'en H1 の途中折返し').toBe(3)
  })

  test('利用規約（ja）: はみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/terms')
    await assertNoHorizontalOverflow(page, 'terms-ja')
  })

  test('プライバシーポリシー（ja）: はみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/privacy')
    await assertNoHorizontalOverflow(page, 'privacy-ja')
  })

  test('404: はみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/no-such-page')
    await assertNoHorizontalOverflow(page, 'not-found')
  })

  test('API キー入力（light）: はみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/')
    await page.getByRole('button', { name: /ライト/ }).click()
    await expect(page).toHaveURL(/#\/ja\/api-key/)
    await assertNoHorizontalOverflow(page, 'api-key')
    await assertNoIosFocusZoom(page, '#api-key-input')
  })

  test('ウィザード（free）: 各質問 + 遷移アニメーション中もはみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/')
    await page.getByRole('button', { name: /フリー/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)
    const vw = await page.evaluate(() => document.documentElement.clientWidth)

    await page.waitForTimeout(400) // 初回マウントアニメーション完了待ち
    await assertNoHorizontalOverflow(page, 'wizard-q1')
    // overflow-x ガードが sticky bottom CTA を壊していないことの証明
    await expect(page.getByTestId('wizard-cta-footer')).toBeInViewport()

    // Q1 → Q2: 遷移アニメーション中（wizard-fade-in 300ms）の最大はみ出しをサンプリング
    await page.locator('button[aria-pressed]').first().click()
    await startOverflowSampling(page)
    await page.getByRole('button', { name: /次へ/i }).click()
    await page.waitForTimeout(450)
    expect(await stopOverflowSampling(page), 'Q1→Q2 遷移中のはみ出し').toBeLessThanOrEqual(vw + 1)
    await assertNoHorizontalOverflow(page, 'wizard-q2')

    // Q2 はテキスト入力質問: iOS フォーカス自動ズームの発火条件を検査
    await assertNoIosFocusZoom(page, 'input[type="text"]')

    // Q2 → Q3
    await page.getByRole('textbox').fill('MobileTest')
    await startOverflowSampling(page)
    await page.getByRole('button', { name: /次へ/i }).click()
    await page.waitForTimeout(450)
    expect(await stopOverflowSampling(page), 'Q2→Q3 遷移中のはみ出し').toBeLessThanOrEqual(vw + 1)
    await assertNoHorizontalOverflow(page, 'wizard-q3')
  })

  test('完了画面（free 完走後）: はみ出しなし', async ({ page }) => {
    await page.goto('/#/ja/')
    await page.getByRole('button', { name: /フリー/ }).click()
    await expect(page).toHaveURL(/#\/ja\/wizard/)
    await answerFreeWizard(page)
    await expect(page).toHaveURL(/#\/ja\/complete/, { timeout: 15000 })
    await page.waitForTimeout(400)
    await assertNoHorizontalOverflow(page, 'complete')
  })
})
