import { i18n, type GeneratedI18nStructure } from '#i18n'
import { parse } from 'yaml'

export type MessageKey = keyof GeneratedI18nStructure & string

// Native names, so a user can find their language whatever the UI is set to.
export const LANGUAGES = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt_BR: 'Português (Brasil)',
  pt_PT: 'Português (Portugal)',
  ru: 'Русский',
  tr: 'Türkçe',
  uk: 'Українська',
} as const

export type LanguageCode = keyof typeof LANGUAGES
export type Language = 'auto' | LanguageCode

export const DEFAULT_LANGUAGE: Language = 'auto'

const flatten = (
  value: Record<string, unknown>,
  prefix = '',
): Record<string, string> =>
  Object.entries(value).reduce<Record<string, string>>((acc, [key, item]) => {
    const full = prefix ? `${prefix}.${key}` : key

    if (typeof item === 'string') acc[full] = item
    else Object.assign(acc, flatten(item as Record<string, unknown>, full))

    return acc
  }, {})

const files = import.meta.glob<string>('../locales/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const messages = Object.fromEntries(
  Object.entries(files).map(([file, raw]) => [
    file.match(/([^/]+)\.yml$/)![1],
    flatten(parse(raw)),
  ]),
) as Record<LanguageCode, Record<string, string>>

export const isLanguage = (value: unknown): value is Language =>
  value === 'auto' || (typeof value === 'string' && value in LANGUAGES)

// `auto` follows the browser UI language; anything else is looked up in the
// bundled locale files, falling back to English like the browser does.
export const translate = (key: MessageKey, language: Language): string => {
  if (language === 'auto') return (i18n.t as (key: string) => string)(key)

  return messages[language]?.[key] ?? messages.en[key] ?? key
}

// BCP 47 tag for Intl and the `lang` attribute (`pt_BR` -> `pt-BR`).
export const resolveLocale = (
  language: Language,
  browserLanguage: string,
): string =>
  language === 'auto' ? browserLanguage : language.replace('_', '-')
