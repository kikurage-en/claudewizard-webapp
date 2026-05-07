import type { TemplateVars } from './render'

const DOMAIN_LABELS: Record<string, { ja: string; en: string }> = {
  software: { ja: 'ソフトウェア開発', en: 'Software Development' },
  'data-research': { ja: 'データ分析・機械学習・リサーチ', en: 'Data Analysis / Machine Learning / Research' },
  writing: { ja: '文章作成・ドキュメント整備', en: 'Writing / Documentation' },
  sns: { ja: 'SNS運用・マーケティング', en: 'SNS Management / Marketing' },
  automation: { ja: '業務効率化・自動化', en: 'Workflow Automation' },
  design: { ja: 'デザイン・クリエイティブ', en: 'Design / Creative' },
  other: { ja: 'その他', en: 'Other' },
}

const WORK_TYPE_LABELS: Record<string, { ja: string; en: string }> = {
  create: { ja: '新しいものを作る', en: 'Creating new things' },
  investigate: { ja: '問題を調査・修正する', en: 'Investigating and fixing issues' },
  improve: { ja: '既存のものを改善する', en: 'Improving existing work' },
  review: { ja: 'レビュー・品質チェック', en: 'Review and quality assurance' },
  mixed: { ja: '幅広い作業', en: 'Various tasks' },
}

const TOOL_LABELS: Record<string, { ja: string; en: string }> = {
  programming: { ja: 'プログラミング言語', en: 'Programming languages' },
  office: { ja: 'オフィス系ツール', en: 'Office tools' },
  creative: { ja: 'クリエイティブツール', en: 'Creative tools' },
  sns: { ja: 'SNSプラットフォーム', en: 'SNS platforms' },
  cli: { ja: 'コマンドライン・シェル', en: 'Command line / Shell' },
  other: { ja: 'その他', en: 'Other' },
}

const GOAL_LABELS: Record<string, { ja: string; en: string }> = {
  speed: { ja: '作業スピードの向上', en: 'Increasing work speed' },
  quality: { ja: 'アウトプット品質の向上', en: 'Improving output quality' },
  learning: { ja: '新しいことを素早く学ぶ', en: 'Learning new things quickly' },
  team: { ja: 'チーム・組織の生産性向上', en: 'Boosting team and organization productivity' },
}

export function parseAnswers(
  answers: Record<string, string>,
  lang: 'ja' | 'en'
): TemplateVars {
  const domain = answers['q1'] ?? 'other'
  const projectName = answers['q2'] ?? 'my-project'
  const workType = answers['q3'] ?? 'mixed'
  const tool = answers['q4'] ?? 'other'
  const goal = answers['q5'] ?? 'quality'

  return {
    projectName: projectName.trim(),
    domain: (DOMAIN_LABELS[domain]?.[lang] ?? domain),
    workType: (WORK_TYPE_LABELS[workType]?.[lang] ?? workType),
    tool: (TOOL_LABELS[tool]?.[lang] ?? tool),
    goal: (GOAL_LABELS[goal]?.[lang] ?? goal),
  }
}
