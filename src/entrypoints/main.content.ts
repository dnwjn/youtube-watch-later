import { browser } from 'wxt/browser'

import { startRelay, type MessageName } from '~/helpers/messaging'
import { watchStored } from '~/helpers/storage'
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
    startRelay((name) => sendToBackground(name))

    watchStored(watchedButtonSettingsKeys, async () => {
      const settings = await sendToBackground<Settings>('settings')

      window.dispatchEvent(
        new CustomEvent('ytwl-settings-changed', { detail: settings }),
      )
    })
  },
})
