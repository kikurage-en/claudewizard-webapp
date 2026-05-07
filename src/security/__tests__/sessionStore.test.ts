import { describe, it, expect, beforeEach } from 'vitest'
import { saveApiKey, getApiKey, clearApiKey } from '../sessionStore'

describe('sessionStore', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('APIキーを保存・取得できる', () => {
    saveApiKey('sk-ant-test123')
    expect(getApiKey()).toBe('sk-ant-test123')
  })

  it('保存していない場合はnullを返す', () => {
    expect(getApiKey()).toBeNull()
  })

  it('clearApiKey後はnullを返す', () => {
    saveApiKey('sk-ant-test123')
    clearApiKey()
    expect(getApiKey()).toBeNull()
  })

  it('複数回保存しても最新の値を返す', () => {
    saveApiKey('sk-ant-first')
    saveApiKey('sk-ant-second')
    expect(getApiKey()).toBe('sk-ant-second')
  })

  it('sessionStorageキーはcw_api_keyを使う', () => {
    saveApiKey('sk-ant-test')
    expect(sessionStorage.getItem('cw_api_key')).toBe('sk-ant-test')
  })
})
