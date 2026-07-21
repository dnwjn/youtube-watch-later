import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import type { Settings } from '~interfaces'

export const buttonOpacity = async (): Promise<string> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.buttonOpacity
}

export const buttonPosition = async (context: string): Promise<string> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings[context as keyof Settings] as string
}

export const buttonVisibility = async (): Promise<string> => {
  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })

  return settings.buttonVisibility
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
