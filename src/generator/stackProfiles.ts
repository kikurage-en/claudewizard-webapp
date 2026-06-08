import type { TemplateVars } from './render'

// Free 専用の Tech Stack マッピング。
// 質問 `stack`（言語）の回答から CLAUDE.md の Tech Stack / Build & Test / Architecture を実値化する。
//
// 設計方針（adversarial review pivot）:
// - 確実に実値化できるのは「言語名（Tech Stack）」のみ。
// - Build & Test はパッケージマネージャ/テストランナー/テスト有無を問わないため、
//   コマンドを断定しない（推測注入の回避）。CLI 規約「Claude が推測できないコマンドのみ記載」に沿った完成文にする。
//   例外: go / rust は標準ツールチェーンが一意（go / cargo）なため名指し可。ts / python は分岐するため名指ししない。
// - 記入指示（命令形「〜を書く」「実際の〜に置き換える」）は一切使わない完成文にする。

type StackVars = { techStack: string; buildCommands: string; architecture: string }

const STACK_PROFILES: Record<string, { ja: StackVars; en: StackVars }> = {
  ts: {
    ja: {
      techStack: '- 言語: TypeScript / JavaScript\n- 実行環境: Node.js',
      buildCommands:
        'TypeScript / Node.js の標準ツールでビルド・テストを実行する。Claude が推測できないプロジェクト固有のコマンドだけをこのセクションに集約する。',
      architecture: 'TypeScript プロジェクトの一般的な構成（`src/` 本体・`tests/` テスト）を前提に Claude が動作する。',
    },
    en: {
      techStack: '- Language: TypeScript / JavaScript\n- Runtime: Node.js',
      buildCommands:
        'Build and test with the standard TypeScript / Node.js tooling. Keep only project-specific commands that Claude cannot infer in this section.',
      architecture: 'Claude assumes a conventional TypeScript layout (`src/` for code, `tests/` for tests).',
    },
  },
  python: {
    ja: {
      techStack: '- 言語: Python',
      buildCommands:
        'Python の標準的なツールでテスト・実行する。Claude が推測できないプロジェクト固有のコマンドだけをこのセクションに集約する。',
      architecture: 'Python プロジェクトの一般的な構成（パッケージディレクトリ・`tests/` テスト）を前提に Claude が動作する。',
    },
    en: {
      techStack: '- Language: Python',
      buildCommands:
        'Test and run with the standard Python tooling. Keep only project-specific commands that Claude cannot infer in this section.',
      architecture: 'Claude assumes a conventional Python layout (a package directory and `tests/`).',
    },
  },
  go: {
    ja: {
      techStack: '- 言語: Go',
      buildCommands:
        'Go の標準ツールチェーン（`go build` / `go test`）でビルド・テストする。Claude が推測できないプロジェクト固有のコマンドだけをこのセクションに集約する。',
      architecture: 'Go プロジェクトの一般的な構成（`cmd/`・`internal/`・`pkg/`）を前提に Claude が動作する。',
    },
    en: {
      techStack: '- Language: Go',
      buildCommands:
        'Build and test with the standard Go toolchain (`go build` / `go test`). Keep only project-specific commands that Claude cannot infer in this section.',
      architecture: 'Claude assumes a conventional Go layout (`cmd/`, `internal/`, `pkg/`).',
    },
  },
  rust: {
    ja: {
      techStack: '- 言語: Rust',
      buildCommands:
        'Rust の標準ツールチェーン（Cargo: `cargo build` / `cargo test`）でビルド・テストする。Claude が推測できないプロジェクト固有のコマンドだけをこのセクションに集約する。',
      architecture: 'Rust プロジェクトの一般的な構成（`src/`・`tests/`）を前提に Claude が動作する。',
    },
    en: {
      techStack: '- Language: Rust',
      buildCommands:
        'Build and test with the standard Rust toolchain (Cargo: `cargo build` / `cargo test`). Keep only project-specific commands that Claude cannot infer in this section.',
      architecture: 'Claude assumes a conventional Rust layout (`src/`, `tests/`).',
    },
  },
  'other-code': {
    ja: {
      techStack: '- 言語: 複数またはその他のプログラミング言語',
      buildCommands:
        '使用言語の標準的なツールでビルド・テストする。Claude が推測できないプロジェクト固有のコマンドだけをこのセクションに集約する。',
      architecture: 'プロジェクトの規模・言語に応じた一般的なディレクトリ構成を前提に Claude が動作する。',
    },
    en: {
      techStack: '- Language: Multiple or other programming languages',
      buildCommands:
        'Build and test with the standard tooling for your language. Keep only project-specific commands that Claude cannot infer in this section.',
      architecture: 'Claude assumes a conventional layout appropriate to the project size and language.',
    },
  },
  'non-code': {
    ja: {
      techStack: '- 主な作業: ドキュメント・コンテンツなどコード以外の成果物',
      buildCommands: 'このプロジェクトは主にコード以外の成果物を扱うため、ビルド手順は不要。',
      architecture: '成果物・ドキュメントを目的別のディレクトリに整理することを前提に Claude が動作する。',
    },
    en: {
      techStack: '- Focus: Documentation, content, and other non-code deliverables',
      buildCommands: 'This project mainly handles non-code deliverables, so no build steps are required.',
      architecture: 'Claude assumes deliverables and documents are organized into purpose-specific directories.',
    },
  },
}

const FALLBACK = 'other-code'

/**
 * stack 質問の回答（言語）から Tech Stack / Build & Test / Architecture の実値を返す。
 * 未知の値・未回答は other-code にフォールバックし、破綻しない完成文を返す。
 * Free 経路（generate.ts）でのみ呼ばれる（Light/Plus は API 生成のため非到達）。
 */
export function buildStackVars(stackValue: string, lang: 'ja' | 'en'): TemplateVars {
  const profile = STACK_PROFILES[stackValue] ?? STACK_PROFILES[FALLBACK]
  const v = profile[lang]
  return {
    techStack: v.techStack,
    buildCommands: v.buildCommands,
    architecture: v.architecture,
  }
}
