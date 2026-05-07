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

export function getManifest(plan: 'free' | 'light' | 'plus'): ZipEntry[] {
  if (plan === 'light' || plan === 'plus') return LIGHT_MANIFEST
  return FREE_MANIFEST
}
