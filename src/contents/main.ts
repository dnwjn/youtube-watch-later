import type { PlasmoCSConfig } from 'plasmo'

import { sendToBackground } from '@plasmohq/messaging'
import { relay } from '@plasmohq/messaging/relay'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
}

relay(
  {
    name: 'settings' as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req)
    return openResult
  },
)

relay(
  {
    name: 'visitor-cookie' as const,
  },
  async (req) => {
    const openResult = await sendToBackground(req)
    return openResult
  },
)
