const API_KEY_KEY = 'cw_api_key'

export function saveApiKey(key: string): void {
  sessionStorage.setItem(API_KEY_KEY, key)
}

export function getApiKey(): string | null {
  return sessionStorage.getItem(API_KEY_KEY)
}

export function clearApiKey(): void {
  sessionStorage.removeItem(API_KEY_KEY)
}
