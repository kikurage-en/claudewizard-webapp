import { describe, it, expect } from 'vitest'
import { parseHash, buildHash, navigate } from '../router/routes'

describe('parseHash', () => {
  it('空の場合はnot-foundを返す', () => {
    expect(parseHash('')).toEqual({ name: 'not-found' })
  })

  it('/ja/ はtopページを返す', () => {
    expect(parseHash('#/ja/')).toEqual({ name: 'top', lang: 'ja' })
  })

  it('/en/ はtopページを返す', () => {
    expect(parseHash('#/en/')).toEqual({ name: 'top', lang: 'en' })
  })

  it('/ja はtopページを返す（サブパスなし）', () => {
    expect(parseHash('#/ja')).toEqual({ name: 'top', lang: 'ja' })
  })

  it('/ja/api-key はapi-keyページを返す', () => {
    expect(parseHash('#/ja/api-key')).toEqual({ name: 'api-key', lang: 'ja' })
  })

  it('/en/api-key はapi-keyページを返す', () => {
    expect(parseHash('#/en/api-key')).toEqual({ name: 'api-key', lang: 'en' })
  })

  it('/ja/wizard はwizardページを返す', () => {
    expect(parseHash('#/ja/wizard')).toEqual({ name: 'wizard', lang: 'ja' })
  })

  it('/en/wizard はwizardページを返す', () => {
    expect(parseHash('#/en/wizard')).toEqual({ name: 'wizard', lang: 'en' })
  })

  it('/ja/complete はcompleteページを返す', () => {
    expect(parseHash('#/ja/complete')).toEqual({ name: 'complete', lang: 'ja' })
  })

  it('/ja/terms はtermsページを返す', () => {
    expect(parseHash('#/ja/terms')).toEqual({ name: 'terms', lang: 'ja' })
  })

  it('/ja/privacy はprivacyページを返す', () => {
    expect(parseHash('#/ja/privacy')).toEqual({ name: 'privacy', lang: 'ja' })
  })

  it('未知のパスはnot-foundを返す', () => {
    expect(parseHash('#/ja/unknown')).toEqual({ name: 'not-found' })
  })

  it('言語なしはnot-foundを返す', () => {
    expect(parseHash('#/wizard')).toEqual({ name: 'not-found' })
  })
})

describe('buildHash', () => {
  it('サブパスなしのhashを生成する', () => {
    expect(buildHash('top', 'ja')).toBe('#/ja')
  })

  it('サブパスありのhashを生成する', () => {
    expect(buildHash('wizard', 'en', 'wizard')).toBe('#/en/wizard')
  })
})

describe('navigate', () => {
  it('hashを設定する', () => {
    navigate('#/ja/wizard')
    expect(window.location.hash).toBe('#/ja/wizard')
  })

  it('#なしでも設定できる', () => {
    navigate('/ja/complete')
    expect(window.location.hash).toBe('#/ja/complete')
  })
})
