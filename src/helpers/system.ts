import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import type { Settings } from '~interfaces'

export const buttonOpacity = async (): Promise<string> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.buttonOpacity
}

export const buttonPosition = async (): Promise<string> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.buttonPosition
}

export const loggingEnabled = async (): Promise<boolean> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.loggingEnabled
}

export const markNotificationsAsRead = async (): Promise<boolean> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.markNotificationsAsRead
}
