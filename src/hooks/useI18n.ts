import { useCallback, useEffect } from 'react'

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  resolveLocale,
  translate,
  type Language,
  type MessageKey,
} from '~/helpers/i18n'

import useStorage from './useStorage'

const useI18n = () => {
  const [stored] = useStorage<Language>('language', DEFAULT_LANGUAGE)
  const language = isLanguage(stored) ? stored : DEFAULT_LANGUAGE

  const t = useCallback(
    (key: MessageKey) => translate(key, language),
    [language],
  )

  const locale = resolveLocale(language, browser.i18n.getUILanguage())

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return { t, language, locale }
}

export default useI18n
