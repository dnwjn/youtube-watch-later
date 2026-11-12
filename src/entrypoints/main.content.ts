import { browser } from 'wxt/browser'

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  translate,
  type Language,
} from '~/helpers/i18n'
import { startRelay, type MessageName } from '~/helpers/messaging'
import { getStored, watchStored } from '~/helpers/storage'
import type { Settings } from '~/interfaces'
import { ButtonPositionContext } from '~/types'

const watchedButtonSettingsKeys = [
  'buttonOpacity',
  'buttonVisibility',
  ButtonPositionContext.Thumbnail,
  ButtonPositionContext.Playlist,
  ButtonPositionContext.EndscreenModern,
  ButtonPositionContext.Sidebar,
  ButtonPositionContext.Notification,
  ButtonPositionContext.Endscreen,
]

const sendToBackground = async <T>(name: MessageName): Promise<T> => {
  const response = await browser.runtime.sendMessage({ name })

  if (response?.error) throw new Error(response.error)

  return response?.data as T
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    startRelay(async (name) => {
      if (name === 'button-labels') {
        const stored = await getStored<Language>('language')
        const language = isLanguage(stored) ? stored : DEFAULT_LANGUAGE

        return {
          add: translate('button.add', language),
          adding: translate('button.adding', language),
          added: translate('button.added', language),
          error: translate('button.error', language),
        }
      }

      return sendToBackground(name)
    })

    watchStored(['language'], () => {
      window.dispatchEvent(new CustomEvent('ytwl-language-changed'))
    })

    watchStored(watchedButtonSettingsKeys, async () => {
      const settings = await sendToBackground<Settings>('settings')

      window.dispatchEvent(
        new CustomEvent('ytwl-settings-changed', { detail: settings }),
      )
    })
  },
})
