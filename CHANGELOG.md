# CHANGELOG

## v0.6.2 (2026-06-12)

### UI 微調整 3 件（完了画面の余白・質問画面の視線動線・ページ遷移スクロール）

実機フィードバック 3 件に対応。

#### 修正

- **マスコットの右下固定（スクロール追従）**: `MascotCorner` を `absolute` → `fixed bottom-5 right-5 z-30` に変更。長いページ（完了画面等）で下端のイルカが見切れる問題を解消し、全ページで右下に常時表示。未配置だった API キー入力・利用規約・プライバシーポリシーにも追加（64px・吹き出しなし）。404 は中央の大型マスコット演出が既存のため対象外。WizardPage の CTA 回避用 `!bottom-24` は CTA が上部へ移動したため撤去
- **完了画面の上部余白圧縮**: `py-12 md:py-16` → `py-6 md:py-8`、ドット/マスコット/説明文/ファイルカードの `mb` を 1 段階圧縮（ヘッダー〜見出しの無駄なマージンを解消）
- **質問画面の視線動線（PC）**: 質問エリアの `flex-1` を撤去し OK/次へ ボタンを選択肢直下に、左パネルのヒント（TIP）の `mt-auto` を撤去し進捗バー直下に配置（上下パーツの間延びを解消）。モバイルの sticky CTA は維持（コンテンツが長い時のみ下端に貼り付く）
- **ページ遷移時のスクロールリセット**: route 変更時に `window.scrollTo(0, 0)`（言語切替は同一コンテンツのため位置維持）。ウィザード内の質問遷移時も同様にリセット（モバイルで前画面のスクロール位置を引き継ぐ問題を解消）

#### テスト・検証

- 新規 3 件: route 遷移スクロールリセット（App）/ 質問遷移スクロールリセット（WizardPage）/ MascotCorner fixed 配置。jsdom 未実装の `window.scrollTo` は test-setup で no-op 化し spy 検証可能に
- 単体 474 件 PASS / typecheck PASS / mobile-overflow E2E 16 件 PASS（sticky CTA 可視・はみ出し回帰なし）/ free-flow E2E 8 件 PASS

## v0.6.1 (2026-06-11)

### モバイル実機（iPhone Safari）の横はみ出し・レイアウト崩れ修正

実機報告（ページ幅はみ出し + 崩れ散見）に対応。e2e にモバイルビューポートが皆無で実機まで検出できない構造だったため、WebKit 390px/375px の横はみ出し回帰テストを先行追加（TDD・修正前 RED 7 件）してから修正。

#### 修正

- TopPage H1: モバイル 36px → 28px（デザイン正の「H1 モバイル 28-32px / 行高 1.25」に接地）。ja 3 行目「ちゃんと書けてますか？」（11 全角字）が 375-390px 幅で途中折返しして 4 行になる崩れを解消
- 入力欄（TextInput / ApiKeyPage）: モバイル 14px → 16px（`text-base md:text-sm`）。font-size < 16px の入力欄は iOS Safari 実機がフォーカス時にページを自動ズームし横はみ出しの原因になる（エミュレーション非再現の実機固有挙動 = 報告症状の最有力原因）
- グローバルガード: html/body に `overflow-x: clip`（スクロールコンテナを作らず sticky 非破壊。iOS15 以下は @supports フォールバック）
- PixelDolphin: SVG `overflow: visible` → `hidden`（iOS Safari は SVG 描画域をスクロール領域に算入しうる）。クリップ安全性の不変条件「半対角 + √(bob²+sway²) ≤ GRID/2 + pad」を定数 export + 単体テストで機械検証
- 折返し保険: CompletePage ファイルパスに `break-all`、Terms/Privacy 本文に `break-words`

#### テスト・検証

- e2e/mobile-overflow.spec.ts 新規（iPhone 12=390px / iPhone 11 Pro=375px の 2 プロジェクト）: 全 7 ページ + ウィザード遷移アニメ中を検証。判定は overflow-x ガードに依存しない要素検査 2 種（border-box 掃引 + overflow-x:visible 要素の内容あふれ）+ H1 実レンダリング行数 + 入力欄 font-size ≥ 16px + sticky CTA 可視。修正後 16 件全 PASS
- 単体 471 件 PASS（PixelDolphin 不変条件 2 件追加）/ typecheck PASS / free-flow E2E PASS
- 既知の別件: free-flow のキーボード系 2 テストがローカル一括実行時のみフレーク（ベースラインでも同一再現 = 本変更と無関係。CI は workers=1 で green）
- CI: e2e.yml のブラウザインストールに webkit を追加
- wizard-fade-in の `translateX(8px)` は当初修正候補だったが、rAF サンプリング実測で main の `p-6` に吸収されはみ出さないことを確認し据え置き（回帰は遷移中サンプリングが恒久ガード）

## v0.6.0 (2026-06-11)

### Free の 7 分野コンテンツ差別化（SKILL.md + CLAUDE.md 作業ルール）

ユーザー指摘「Free でどの選択肢を選んでも skills・rules の差が感じにくい」に対応。q1 の 7 分野（software / data-research / writing / sns / automation / design / other）を SKILL.md と CLAUDE.md に効かせる。接地元 = CLI 版の分野別重点テーブル（コンテンツ=事実確認・引用検証 / 調査研究=データ検証・出典確認 / 自動化=動作確認・影響範囲 / 開発=テスト要件・レビュー基準）+ 公式 skills repo の設計基準（起動キーワード=undertrigger 対策・Gotchas）。design は CLI 非対応のため公式 skills repo（brand-guidelines / canvas-design）に接地。**rules 4 ファイルは普遍維持**（CLI 原則: security-guidelines は分野分岐しない。ユーザー確認済み）。

#### 修正

- `domainProfiles`: DOMAIN_CONTENT（6 分野 × ja/en × 5 サーフェス）を追加。`buildDomainVars` に第 3 引数 domain（省略時 'other' = 分野個性なしフォールバック）。分野軸は code/non-code 軸と直交（例: writing×ts は code 系作業ルール + writing 分野個性）
- SKILL.md テンプレ: frontmatter 起動条件に分野フレーズ（`{{skillTriggers}}`）、/verify に分野観点（`{{verifyFocus}}`）、/review 説明の分野化（`{{reviewDescription}}` を分野 keyed に・other は isCode 2-way へフォールバック）、「よくある落とし穴」節（`{{skillGotchas}}`・2 項目）を追加
- CLAUDE.md テンプレ: 作業ルール末尾に分野規律 ≤2 行（`{{domainWorkRules}}`。例: sns「未確認の情報を断定形で投稿文にしない」、automation「一括処理は dry-run か少数試行で確認してから本実行」）
- `lightGenerator` は**無変更**（domain デフォルト引数で Light 静的 5 rules の出力不変を構造的に保証。Light の CLAUDE/SKILL/README は API 生成で従来どおり回答適応）

#### テスト・検証（Codex adversarial review 3 件の BLOCK 反映）

- domain-quality: per-surface 分野シグネチャ（trigger//verify//review/Gotchas=SKILL.md、分野規律=CLAUDE.md の 5 マーカー × 6 分野 × ja/en）を両方向検証（自分野に存在・他分野に不在・other は全不在）。単一マーカー方式は 4 面の実装漏れを検出できないため不採用（BLOCK 指摘 3）。CLAUDE.md 用マーカーを SKILL 用と分離（BLOCK 指摘 1）。Light 全組合せに分野マーカー漏出不在 assert を追加 + Light 静的テンプレが reviewDescription・新設 4 変数を参照しないことを grep で機械確認（BLOCK 指摘 2）
- 全 469 件 PASS / typecheck PASS / coverage 91.21・85.1・95.83・93.51（閾値超）。マーカーと共有固定文の衝突は設計時検算 + grep（claude_md/skill_md 固定部に 0 出現）で確認
- spec 改訂: requirements（Free 出力仕様に分野差別化を明記・Light 静的への非適用を明記）/ 元要件 §3.3（分野回答の昇格注記）/ generator-domain（接地表に分野コンテンツ行を追加）
- Light prompt 無変更のため `.enc` 再暗号化・実 API E2E 再実行は不要（USER-GATED 操作なし）

## v0.5.0 (2026-06-11)

### 生成 CLAUDE.md の「全行が効く」化 + /init 育成フローの明示的前提化

ユーザー指摘（Architecture のディレクトリ構造記載等への違和感）を公式基準（remove テスト・include/exclude 表）で監査し、埋め草節を確認。「実装が進んだら /init で更新するフローの明示的前提化」提案を多角検証のうえ採用（公式: /init は既存 CLAUDE.md を上書きせず改善提案／HTML コメントは context 注入前に剥離）。

#### 修正

- Free CLAUDE.md テンプレ: 埋め草節を削除（Architecture の「一般的な構成を前提」汎用文・プロジェクト概要の同語反復・Build & Test のメタ説明・ライフサイクルスローガン等）→ 約 27 行・全行が remove テスト合格の 4 節構成（Tech Stack / 作業ルール / Security / Skills）。節名「Code Style」→「作業ルール / Working Rules」に統一
- /init 育成フローの案内（code 系 domain のみ）: CLAUDE.md 末尾に HTML コメント（公式仕様でトークン非消費）+ README に「CLAUDE.md の育て方」節。non-code は /init が機能しないため非表示
- stackProfiles: techStack のみ返す設計に（Build & Test / Architecture はコード由来事実のため生成時に捏造せず /init へ委譲）。domainProfiles から lifecycleRule 廃止・initGuidance 2 変数追加
- Light prompt: 「9 節必須」→ 必須 6 節 + 条件付き節（Build & Test / Architecture は回答・備考に実情報がある場合のみ・汎用文充填を禁止）+ 行単位 remove テスト基準 + README /init 節指示（**`.enc` 再暗号化は USER-GATED**）

#### テスト・検証

- domain-quality: 埋め草マーカー不在（全 domain×stack×日英）+ /init 案内の code/non-code 両方向検証を追加。stackProfiles テストは techStack 単独設計＋「コード由来事実を返さない」構造的証明に改訂
- 全 469 件 PASS / typecheck PASS / coverage 91.13・85.01・95.83・93.45（閾値超）
- spec 改訂: requirements（「完成済み」=「全行が効く」定義・/init 前提）/ constraints C-1-2（コード由来事実は /init へ委譲）/ 元要件 §16.1（補完関係の注記）

## v0.4.2 (2026-06-11)

### 完了画面のリロード・直リンクガードの検証固定とリダイレクト

完了画面はメモリ上の完了状態が前提（リロードで回答リセット＝FR-2）。状態なしで /complete に到達した場合に CompletePage を出さないガードは実装済みだったが未テストで、URL が /complete のままトップ内容が表示される不一致（page_view 計測のズレ含む）が残っていた。

#### 修正

- `App`: 完了状態なしの /complete 到達時にトップ（/{lang}）へリダイレクト（空回答のまま生成・Light の API 課金に到達する経路を URL ごと遮断）
- `App.test.tsx` 新規: (1) 状態なし /complete で同意チェック・DL ボタン不在＋トップへ URL 正規化＋generate 未呼出、(2) ウィザード完走→完了画面表示の正常系（ガード誤爆なし）を deterministic に固定

#### テスト・検証

- 全 469 件 PASS / typecheck PASS / coverage 91.15・85.01・95.83・93.46（閾値超）
- spec 改訂: requirements.md FR-4 にガード仕様を追記

## v0.4.1 (2026-06-11)

### 完了画面の整合性修正（2 状態表示 + Blob キャッシュで API 再課金防止）

ユーザー指摘 2 件に対応: (1) 生成前から「完成！設定ファイルが生成されました」と表示される文言と実態（DL ボタン押下時に生成）の不整合、(2) DL ボタンを押すたびに生成が再実行され Light で毎回 API 課金が発生する問題。

#### 修正

- `CompletePage`: 生成済み Blob を state に保持し、2 回目以降のダウンロードは再生成せず Blob を再利用（Light の Claude API 再課金を解消。Free も再 ZIP 組成が不要に）。失敗時は保持せずリトライで再生成。言語/プラン変更時はキャッシュ破棄
- 完了画面を 2 状態化: 生成前は「🚀 READY! 準備完了！／ZIP をダウンロードすると設定ファイルを生成します／FILES TO GENERATE・中立ドット」、生成成功後に「✨ DONE! 完成！／生成されました／GENERATED FILES・✓／ZIP を再ダウンロード」へ切替
- Light のみ DL ボタン直下に課金透明性の注記「生成は Claude API を 1 回だけ呼び出します。再ダウンロードで追加の課金は発生しません。」を表示
- `DownloadButton` に label prop 追加（未指定時は従来どおり）／locales（ja/en）に result 配下 6 キー追加

#### テスト・検証

- 新規 4 件（2 回クリックで generate 1 回のみ・失敗時非キャッシュ・2 状態文言切替・課金注記の plan 別表示）。全体 467 件 PASS / typecheck PASS / coverage 91.15・85.01・95.83・93.46（閾値超）
- spec 改訂: requirements.md FR-4（Blob 保持・2 状態・課金注記）/ acceptance.md Phase 1 注記

## v0.4.0 (2026-06-10)

### 生成物の「ベストプラクティス」接地強化（domain 適合 + CLI 必須 rules 完備）

「ベストプラクティスに沿った完成済みの一式」の訴求と生成物実態のギャップ（非コード分野へのコード専用指示の混入・CLI 必須 rules の欠落・品質の機械検証なし）を解消。

#### 追加

- `src/generator/domainProfiles.ts`: domain 適合（code/non-code 2 分岐）。Code Style ⇔ 作業ルール、構築→テスト→デプロイ ⇔ 確認→作成→見直し、npm audit/SQLi/XSS ⇔ 情報の取り扱い・利用ツール権限、等のセクション単位切替（code 系は現行文言を不変維持）。判定は Free=stack 軸優先 / Light=q1 分野・q4 ツールの信号
- Free 4→5 ファイル: `core-principles.md`（Evidence First / Boundary Check / Failure Reflection）を追加。CLAUDE.md/SKILL/README の @参照・ファイル表にも反映
- Light 6→8 ファイル: `prevent-narrow-framing.md` + `failure-routing.md` を新規テンプレ（ja/en、dotfiles 3 節形式接地）で追加 — CLI 版「全プロジェクト必須 5 rules」を Light で完備
- `src/templates/__tests__/domain-quality.test.ts`: 7 domain × 6 stack/tool 全組合せ（ja/en）で 完成形（未解決変数・TODO なし）・CLAUDE.md ≤100 行・@参照整合（参照先が ZIP に同梱）・code/non-code 文言適合を deterministic 検証（計 176 ケース追加、全体 463 件）

#### 修正

- README テンプレの同語反復（「X は X を目的とする〜」）を解消し、技術スタック節＋core-principles 行を追加
- 訴求文言: Plus の「150-200 指示の予算」（出典 humanlayer ブログ・公式用語でない）を公式表現（CLAUDE.md 簡潔維持の公式推奨）準拠に補正。Free は根拠を具体化（MUST/MUST NOT・@参照・記入指示なし）、Light は「備考・要望の自由記述を含む 6 回答を API 生成が柔軟に反映」を明文化
- Light prompt（平文）: CLAUDE.md の @参照チェーンを 5 rules に拡張（**`.enc` 再暗号化は未実施・USER-GATED**）

#### spec 改訂

- requirements.md（FR-1 表 Free 5 / Light 8・出力ファイル仕様）/ acceptance.md（Phase 1=5・Phase 2=8）/ business-domain.md（150-200 表現の出典補正）/ 元要件定義書 §3.3・§19.1

## v0.3.0 (2026-06-10)

### フロントエンド UI ブラッシュアップ（デザイン確定版寄せ + 品質課題解消）

#### 追加

- `src/ui/components/PixelDolphin.tsx`: マスコットを絵文字🐬から SVG ドット絵（design/mascot.jsx 移植）へ。尾びれフラップ・bob/sway/tilt・約10秒毎のスピン・胸びれのフルアニメーション。`useReducedMotion` hook で JS アニメも prefers-reduced-motion に追従（NFR-4）
- `src/ui/components/MascotCorner.tsx`: コーナーマスコット＋吹き出し（トップ/ウィザード/完了に配置、aria-hidden + pointer-events-none）
- トップ: ドット背景テクスチャ・H1 マーカー強調・オフセット影 CTA・3 ステップ破線チップ・「generates →」ファイルスタンプ（final-variants.jsx 確定コピー採用）
- ウィザード: 左パネル 440px 固定・セグメント分割進捗バー・ChoiceCard 押し込み演出・**モバイル sticky「次へ」フッター**・ESC 中断＋キーヒント
- 完了画面: DONE バッジ（rotate + offset 影）・太枠ファイルカード・CTA 3 系統（DL / トップへ戻る / Web Share 対応時のみシェア）
- E2E: キーボードのみ完走テスト（NFR-4 の deterministic 証明）・Escape 中断テスト

#### 修正

- i18n: NotFoundPage / Footer のハードコード日本語を locales 経由に（英語 UI での表示破綻を解消）
- ブランドカラー: ErrorBanner の Tailwind デフォルト yellow/orange/red を wf-static-errors.jsx の暖色トークン（danger/danger-soft/orange、border-2 + border-l-8）へ、ApiKeyPage の green チェックを orange に（3 色構成遵守）
- エラー時に下フォームを半透明 + pointer-events:none で無効化（FR-11）
- Header/Footer の死にリンク（href="#"）を公開リポジトリ実 URL に。未実装ガイドリンクは Phase 5 まで非表示化
- aria-label の英語ハードコードを i18n 化（ProgressBar/Header）、装飾要素は aria-hidden に統一
- App.tsx: トップ復帰時に wizardPlan をリセット（前回プラン残存の修正）
- 7 択質問でショートカットが欠落する問題を修正（SHORTCUTS A-F → A-H）

#### 性能

- PixelDolphin の身体モーションを React state（60fps setState）から `<g>` transform の直接更新に変更 — 毎フレームの再レンダリングを排除（ローカル Lighthouse mobile: observed FCP 279ms → 200ms、Performance 99 → 100）
- フォント読込: Noto Sans JP 400/500/700 を追加（NFR-10 の 3 フォント構成へ）しつつ、未使用の Zen Kaku Gothic New 400 を削除して Google Fonts CSS を縮減
- tailwind トークン拡張: `orange.hover`（hover 用）/`orange.deep`（影・破線用）の用途分離、オフセット影体系（offset-orange/ink 等）、danger 系

#### テスト・検証

- 単体 287 件 PASS / カバレッジ stmts 90.75 · lines 93.08（閾値超）/ E2E free-flow 8 件 PASS / spec-reviewer 要修正 0 件・Phase 1/2 退行なし
- 新規テスト: PixelDolphin（fake timers + rAF で静止/停止/クリーンアップ）・MascotCorner・ChoiceCard・PlanCard・Header・Footer・ProgressBar・NotFoundPage

## v0.2.2 (2026-06-10)

### Light プラン増強（品質接地 + core-principles 追加 5→6）

#### 追加

- `src/templates/{ja,en}/core_principles_md.ts`: Light に静的テンプレ `core-principles.md`（Evidence First / Boundary Check / Failure Reflection の3原則）を追加。CLI `core-principles.md` から翻案し self-contained 化。Light の出力ファイルが 5 → **6** に。
- `src/templates/manifest.ts`: `LIGHT_MANIFEST` に core-principles を追加（FREE_MANIFEST spread の末尾＝Free/Plus 非波及）。
- `src/generator/lightGenerator.ts`: `loadStaticTemplates` / `allTemplates` に core_principles を配線。
- `scripts/verify-prompts-grounded.sh` + `.github/workflows/e2e.yml`: **.enc 反映漏れ防止ゲート**（復号した light prompt に grounding マーカーの存在を grep 検証。ローカル必須完了条件 + CI ゲート）。

#### 変更

- `src/prompts/light_{ja,en}.ts`（平文）: 生成 prompt を dotfiles/CLI 慣習へ接地 — CLAUDE.md を **最大150行 → 100行以下**（自リポジトリ Truth Source `verification-guidelines.md` に整合）、MUST/MUST NOT 形式、出荷3 rules への @参照チェーン、SKILL.md の YAML frontmatter 必須化、Q3-Q5（作業内容/ツール/目標）の反映を具体マッピング化。**※ `.enc` 再暗号化（USER-GATED）まで本番未反映。**

#### テスト・検証

- `templates/__tests__/manifest.test.ts`（新規）: FREE=4 / LIGHT=6 / PLUS=9・LIGHT[0..3]===FREE・Plus 非波及を deterministic に assert（adversarial review finding 3）。
- `generator/__tests__/lightGenerator.test.ts`: 生成 Blob を展開し 6 entries + core-principles を検証。
- `e2e/light-flow.spec.ts`: ファイル数 6 + **出力構造 assert**（CLAUDE.md ≤100行・@参照3本・SKILL frontmatter、adversarial review finding 2）。
- drift 同時更新: `CompletePage.test.tsx`（light:6）/ `locales/{ja,en}.json`（files_count 6）/ spec（requirements / acceptance）/ 元要件定義書 §3.3・§19.1。

## v0.2.1 (2026-06-04)

### Phase 2 クローズ + GitHub Pages 配信修正 + 公開リポジトリ同期

#### 修正

- `vite.config.ts`: GitHub Pages サブディレクトリ配信のため `GITHUB_REPOSITORY` から base path を動的設定（197d96b）
- `index.html`: 公開 URL を `https://kikurage-en.github.io/claudewizard-webapp/` に統一（og:url / hreflang / JSON-LD、fb10fd6）

#### 追加

- 公開リポジトリ同期スクリプト `scripts/sync-public.sh` と暗号化スクリプトの整備（82191ad）
  - rsync 除外パターンをベースファイル名指定（`light_ja.ts` 等）に修正し全パス階層で確実に除外
- `src/security/__tests__/anthropicClient.test.ts`: timeout（AbortError / message に "timeout"）と 503 の単体テストを追加（401/429/500/503/timeout×2/CORS の 9 ケースに）

#### テスト・検証（Phase 2 正式クローズ）

- 単体・コンポーネント: 152 件全件合格（20 ファイル）
- カバレッジ: All files 94.2% lines / 85.07% branches / 84.72% funcs（閾値 80% クリア）、型チェック合格
- `.claude/spec/acceptance.md` の Phase 2 受け入れ基準を確定（**機能受け入れ全件達成**：実 API キー使用の完走 E2E も実キーで `2 passed`、他は証跡付きで [x]）
- spec-reviewer / impl-validator 実行済み（prompt 平文コミットの誤検知を git ls-files / .gitignore で否定、ブロッカーなし）
- 定期チェック実施（health-check 疎通 / npm audit / Web ドキュメント確認、2026-06-04）

## v0.2.0 (2026-05-02)

### Phase 2 完成（Light プラン / BYOK + Claude API）

#### 追加

- Light プランの完走フロー（トップ → API キー入力 → Q1-Q6 → Claude API 生成 → ZIP DL）
- 5 ファイル生成（Free 4 + development-workflow.md）
- BYOK（Bring Your Own Key）基盤
  - `src/security/sessionStore.ts`: API キーを sessionStorage に保存（タブ閉じで自動削除）
  - `src/ui/pages/ApiKeyPage.tsx`: パスワード型入力 + 表示トグル + 注記表示（FR-5）
- Claude API クライアント（`src/security/anthropicClient.ts`）
  - `@anthropic-ai/sdk` + `dangerouslyAllowBrowser: true` + 専用ヘッダー
  - エラー分類: auth / rate_limit / server / timeout / cors / unknown
- 出力パース（`src/generator/parseClaudeOutput.ts`）
  - マークダウンコードブロック除去 + JSON 抽出（要件定義書 §4.4 #1）
- Light 用ジェネレータ（`src/generator/lightGenerator.ts`）
  - API 1-2 回呼び出し + パース失敗時リトライ（要件定義書 §4.4 #3）
- プロンプト暗号化基盤
  - `scripts/encrypt-prompts.sh` / `decrypt-prompts.sh`（openssl aes-256-cbc + pbkdf2）
  - `vite.config.ts` で `.enc` をビルド時復号 → `define` で埋め込み
  - `src/security/promptLoader.ts`: 復号失敗時に致命的エラー（要件定義書 §20.2）
  - `src/prompts/light_ja.enc` / `light_en.enc` をコミット、平文 `.ts` は `.gitignore` で除外
- エラーハンドリング UI（`src/ui/components/ErrorBanner.tsx`）
  - 3 分類別表示（auto_recovery / user_action / fatal）
  - 再試行・閉じるボタン（致命的エラーは再試行不可）
- E2E テスト（`e2e/light-flow.spec.ts`）
  - 実 API キー使用、Light 完走 → 5 ファイル ZIP 検証
  - `ANTHROPIC_API_KEY` 未設定時は自動 skip
- Q6（備考・要望）: Light/Plus プランのみで表示、optional テキスト入力
- CI 連携
  - `.github/workflows/deploy.yml`: `VITE_PROMPT_ENCRYPTION_KEY` を Secrets から
  - `.github/workflows/e2e.yml`: `VITE_PROMPT_ENCRYPTION_KEY` + `ANTHROPIC_API_KEY` を Secrets から

#### 改善

- E2E config: `package.json test:e2e` に `--config=e2e/playwright.config.ts` を明示（src/ 配下の `.test.tsx` 誤検出を防ぐ）

#### テスト

- 単体・コンポーネント: 149 件全件合格（Free 100 件 + Phase 2 で 49 件追加）
- E2E: free-flow 6 件合格、light-flow 2 件（実 API 必要 / 未設定時 skip）
- 型チェック合格、ビルド成功（暗号化プロンプトを bundle に正しく埋め込み）

#### セキュリティ

- API キー: `sessionStorage` のみ、サーバー送信なし
- プロンプト: openssl aes-256-cbc + pbkdf2 で暗号化、復号キーは GitHub Secrets
- 平文プロンプト（`light_*.ts`）は `.gitignore` で git 管理対象外

---

## v0.1.1 (2026-05-02)

### Q1-Q5 質問・選択肢の汎用化

#### 変更

- Q1〜Q5 の質問・選択肢をソフトウェア開発に特化した内容から、SNS 運用・文章作成・データ分析・デザイン・業務効率化など幅広い分野に対応する汎用設計に刷新
- Q1（分野）: `frontend` / `backend` / `mobile` 等の開発職種から `software` / `data-research` / `writing` / `sns` / `automation` / `design` / `other` の職種横断カテゴリーに変更
- Q4（ツール）: テンプレート変数名を `{{techStack}}` → `{{tool}}` に改名し、「プログラミング言語」に加えて「オフィスツール」「クリエイティブツール」「SNS プラットフォーム」「コマンドライン」を選択肢に追加
- `src/locales/ja.json` / `en.json` の wizard セクション更新
- `src/generator/parseAnswers.ts` のラベルマップを全面改訂
- `src/templates/ja/` / `en/` 全 4 テンプレートの変数参照を `{{tool}}` に更新

---

## v0.1.0 (2026-05-02)

### Phase 1 完成（MVP / Free プラン）

#### 追加

- Free プランの完走フロー（トップ → プラン選択 → Q1-Q5 → 生成 → ZIP DL）
- 4 ファイル生成（CLAUDE.md / README.md / SKILL.md / security-guidelines.md）を ZIP に含む
- 利用規約に同意するチェックなしでは ZIP ダウンロード不可
- 日英対応（URL 駆動 i18n、`/ja/` ↔ `/en/` 切替）
- hash ルーティング（GitHub Pages 対応）
- GA4 analytics 基盤（page_view / plan_select / zip_download 等 8 イベント）
- 単体テスト・コンポーネントテスト（Vitest + React Testing Library）
- E2E テスト（Playwright）
- GitHub Actions CI（unit-and-component / type-check / e2e / deploy）
- E2E テスト CI ワークフロー（.github/workflows/e2e.yml）— production build + preview server で Playwright を実行

#### 改善

- Google Fonts を非レンダーブロッキング読み込みに変更（rel="preload" as="style" onload パターン）
  - Mobile Lighthouse Performance: 62 → 100、LCP: 6.3s → 1.4s
- フォントを 3 種（Noto Sans JP + Zen Kaku Gothic New + JetBrains Mono）から 2 種に削減

#### 技術スタック

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS（cream/ink/orange トークン）
- JSZip（クライアントサイド ZIP 生成）
- Vitest + Playwright（テスト）
