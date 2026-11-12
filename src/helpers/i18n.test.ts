import { describe, expect, it } from 'vitest'

import { isLanguage, LANGUAGES, resolveLocale, translate } from '~/helpers/i18n'

describe('translate', () => {
  it('delegates to the browser i18n for auto', () => {
    expect(translate('button.add', 'auto')).toBe('Add to Watch Later')
  })

  it('looks the key up in the chosen locale', () => {
    expect(translate('common.back', 'nl')).toBe('Terug')
  })

  it('falls back to the key when it is unknown', () => {
    expect(translate('nope' as never, 'nl')).toBe('nope')
  })
})

describe('isLanguage', () => {
  it('accepts auto and every bundled locale', () => {
    expect(isLanguage('auto')).toBe(true)
    Object.keys(LANGUAGES).forEach((code) =>
      expect(isLanguage(code)).toBe(true),
    )
  })

  it('rejects anything else', () => {
    expect(isLanguage('xx')).toBe(false)
    expect(isLanguage(undefined)).toBe(false)
  })
})

describe('resolveLocale', () => {
  it('uses the browser language for auto', () => {
    expect(resolveLocale('auto', 'de-AT')).toBe('de-AT')
  })

  it('turns locale codes into BCP 47 tags', () => {
    expect(resolveLocale('pt_BR', 'en')).toBe('pt-BR')
  })
})
