// vite.config.ts の define プラグインによりビルド時に注入される定数
declare const __LIGHT_SYSTEM_PROMPT_JA__: string
declare const __LIGHT_SYSTEM_PROMPT_EN__: string
declare const __PLUS_SYSTEM_PROMPT_JA__: string
declare const __PLUS_SYSTEM_PROMPT_EN__: string

export function getLightSystemPrompt(lang: 'ja' | 'en'): string {
  const prompt = lang === 'ja' ? __LIGHT_SYSTEM_PROMPT_JA__ : __LIGHT_SYSTEM_PROMPT_EN__
  if (!prompt) {
    // 要件定義書 §20.2「Prompt 復号」: 復号失敗は致命的エラー
    throw new Error(`System prompt (${lang}) is unavailable. Build configuration error.`)
  }
  return prompt
}

export function getPlusSystemPrompt(lang: 'ja' | 'en'): string {
  const prompt = lang === 'ja' ? __PLUS_SYSTEM_PROMPT_JA__ : __PLUS_SYSTEM_PROMPT_EN__
  if (!prompt) {
    // plus_*.enc 未provision（Phase 3 スライス A 時点）も含め、復号失敗は致命的エラー
    throw new Error(`Plus system prompt (${lang}) is unavailable. Build configuration error.`)
  }
  return prompt
}
