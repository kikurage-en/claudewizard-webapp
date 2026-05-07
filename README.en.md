# claudewizard-web

A web-based wizard for generating Claude Code configuration files. Browser-only (BYOK), with Free / Light / Plus plans. The Consult plan is delivered separately via the CLI version (claudewizard).

## Overview

| Item | Description |
|------|-------------|
| Purpose | Auto-generate a full Claude Code config set (CLAUDE.md, rules, hooks, SKILL.md, etc.) from Q&A answers, then download as ZIP |
| Operating cost | $0 (GitHub Pages + BYOK) |
| User cost | Free: $0 / Light: API pay-as-you-go / Plus: API + license |
| Compliance | Conforms to Anthropic BYOK model (no OAuth) |

## Quick Start

### For developers (working in this repository)

```bash
git clone <repository>
cd claudewizard-web
npm install

# Local development (set PROMPT_ENCRYPTION_KEY in .env.local)
cp .env.local.example .env.local
# Fill in: VITE_PROMPT_ENCRYPTION_KEY=xxxxx

# Decrypt Light/Plus prompts (.enc → .ts)
PROMPT_ENCRYPTION_KEY=xxxxx bash scripts/decrypt-prompts.sh

npm run dev          # Start dev server
npm test             # Unit/component tests
npm run typecheck    # Type check
npm run test:e2e     # E2E (uses real API)
npm run build        # Production build (VITE_PROMPT_ENCRYPTION_KEY decrypts .enc → bundle)
```

> **Note**: If `.env.local.example` is missing, create `.env.local` directly at the repo root with a single line `VITE_PROMPT_ENCRYPTION_KEY=xxxxx` (`.env.local` is gitignored).

### Encrypting prompts (for maintainers)

After editing the plaintext `src/prompts/light_*.ts` files, update and commit the `.enc` files:

```bash
# 1. Set PROMPT_ENCRYPTION_KEY (must match the GitHub Secret)
export PROMPT_ENCRYPTION_KEY=xxxxx

# 2. Encrypt (light_*.ts → light_*.enc)
bash scripts/encrypt-prompts.sh

# 3. Commit only the .enc files (.ts files are gitignored)
git add src/prompts/light_ja.enc src/prompts/light_en.enc
git commit -m "chore: update Light prompts"
```

### For end users (web app users)

1. Visit https://[your-username].github.io/claudewizard-web/
2. Select a plan (Free / Light / Plus)
3. Light/Plus: enter your Anthropic API key (stored in sessionStorage)
4. Answer 5–6 questions
5. Download the generated ZIP

## Project Structure

```
claudewizard-web/
├── CLAUDE.md                    ← Rules and config for Claude (≤100 lines)
├── README.md                    ← Japanese (primary language)
├── README.en.md                 ← This file (English)
├── package.json
├── vite.config.ts
├── index.html
├── .env.local.example
├── .github/
│   └── workflows/deploy.yml     ← Decrypt → build → deploy to Pages
├── src/
│   ├── ui/                      ← UI layer
│   ├── wizard/                  ← Question flow (Q1–Q6)
│   ├── security/                ← BYOK and license validation
│   ├── generator/               ← File generation logic
│   ├── templates/{ja,en}/       ← Free plan templates
│   ├── locales/{ja,en}.json     ← i18n translations
│   ├── i18n/                    ← Context + useTranslation hook
│   └── prompts/                 ← Light/Plus prompts (encrypted)
├── e2e/                         ← Playwright E2E tests
└── .claude/                     ← Claude Code configuration
```

## Security

- **BYOK**: API keys are kept only in the browser (`sessionStorage`), never sent to a server
- **HTTPS**: All communication (Anthropic API, Polar.sh) is encrypted via HTTPS
- **Prompts**: Light/Plus prompts are encrypted with `openssl aes-256-cbc`; decryption key lives in GitHub Secrets
- **CSP**: XSS protection via CSP headers + no `innerHTML` usage
- **Open source**: The public repository proves "no server transmission" through code transparency

See `.claude/rules/security-guidelines.md` for details.

## Plans

| Plan | Questions | Output files | API calls | Cost |
|------|-----------|--------------|-----------|------|
| Free | 4–5 | 4 | None (template fill) | $0 |
| Light | 5–6 | 5 | 1–2 | API pay-as-you-go (~$0.01–0.05) |
| Plus | 5–6 | 9–11 | 4 (multi-step) | API + license |

## Release Phases

```
Phase 1 (MVP): Free plan + GitHub Pages deploy
Phase 2:       Light plan (BYOK + Claude API)
Phase 3:       Plus plan (Polar.sh + encrypted prompt + multi-step)
Phase 4:       i18n (Japanese/English)
Phase 5:       Content (terms, privacy, FAQ)
Phase 6:       Marketing (articles, social)
Phase 7:       Consult service design
```

## License

MIT License (open-source public repository).

Prompts are encrypted (requires the decryption key from GitHub Secrets). Code is MIT; prompts are included as build artifacts.

## Support / Feedback

- Bug reports: GitHub Issues
- Improvement suggestions: `/improve` skill → generates `claudewizard-web-feedback.md` → feeds back to CLI version
