import type { PlasmoCSConfig } from 'plasmo'

import { sendToBackground } from '@plasmohq/messaging'
import { relay } from '@plasmohq/messaging/relay'
import { Storage } from '@plasmohq/storage'

import type { Settings } from '~interfaces'
import { ButtonPositionContext } from '~types'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
}

relay(
  {
    name: 'settings' as const,
  },
  async (req) => {
    const result = await sendToBackground(req)
    return result
  },
)

relay(
  {
    name: 'visitor-cookie' as const,
  },
  async (req) => {
    const result = await sendToBackground(req)
    return result
  },
)

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

const storage = new Storage()

const onButtonSettingsChanged = async () => {
  const settings: Settings = await sendToBackground({ name: 'settings' })
  window.dispatchEvent(
    new CustomEvent('ytwl-settings-changed', { detail: settings }),
  )
}

storage.watch(
  Object.fromEntries(
    watchedButtonSettingsKeys.map((key) => [key, onButtonSettingsChanged]),
  ),
)
