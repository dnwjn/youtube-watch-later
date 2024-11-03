import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import type { Settings } from '~interfaces'

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

export const analyticsEnabled = async (): Promise<boolean> => {
  if (process.env.NODE_ENV !== 'production') return false

  const settings: Settings = await sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })
  
  return settings.analyticsEnabled
}
