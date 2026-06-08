export type ZipEntry = {
  zipPath: string
  templateKey: string
}

export const FREE_MANIFEST: ZipEntry[] = [
  { zipPath: 'CLAUDE.md', templateKey: 'claude_md' },
  { zipPath: 'README.md', templateKey: 'readme_md' },
  { zipPath: '.claude/skills/main/SKILL.md', templateKey: 'skill_md' },
  { zipPath: '.claude/rules/security-guidelines.md', templateKey: 'security_guidelines_md' },
]

export const LIGHT_MANIFEST: ZipEntry[] = [
  ...FREE_MANIFEST,
  { zipPath: '.claude/rules/development-workflow.md', templateKey: 'development_workflow_md' },
]

// Plus（9 ファイル）。Free/Light と異なり全コンテンツが Claude API 由来（Step3/4/5）または
// JS 整形（structure-design）。hooks は settings.json の hooks キーに統合（要件確認済み）。
// 末尾コメントは生成ソース（plusGenerator が templateKey → content を解決）。
export const PLUS_MANIFEST: ZipEntry[] = [
  { zipPath: 'CLAUDE.md', templateKey: 'claude_md' },                                         // api step3
  { zipPath: 'README.md', templateKey: 'readme_md' },                                         // api step3
  { zipPath: '.claude/skills/main/SKILL.md', templateKey: 'skill_md' },                       // api step4
  { zipPath: '.claude/rules/security-guidelines.md', templateKey: 'security_guidelines_md' }, // api step4
  { zipPath: '.claude/rules/development-workflow.md', templateKey: 'development_workflow_md' },// api step4
  { zipPath: '.claude/rules/coding-standards.md', templateKey: 'coding_standards_md' },       // api step4
  { zipPath: '.claude/agents/review.md', templateKey: 'review_agent_md' },                    // api step5
  { zipPath: '.claude/settings.json', templateKey: 'settings_json' },                         // api step5（JS マージ）
  { zipPath: '.claude/reports/structure-design.md', templateKey: 'structure_design_report' }, // js 整形（Step1）
]

export function getManifest(plan: 'free' | 'light' | 'plus'): ZipEntry[] {
  if (plan === 'plus') return PLUS_MANIFEST
  if (plan === 'light') return LIGHT_MANIFEST
  return FREE_MANIFEST
}
