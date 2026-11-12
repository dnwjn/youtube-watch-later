import { sendToBackgroundViaRelay } from '~/helpers/messaging'
import type { ButtonLabels, Settings } from '~/interfaces'

export const getSettings = async (): Promise<Settings> => {
  return sendToBackgroundViaRelay<Settings>({
    name: 'settings',
  })
}

// Content scripts in the MAIN world can't reach browser.i18n, so the labels are
// resolved by the isolated-world relay and cached until the language changes.
let buttonLabels: Promise<ButtonLabels> | undefined

export const getButtonLabels = (): Promise<ButtonLabels> => {
  buttonLabels ??= sendToBackgroundViaRelay<ButtonLabels>({
    name: 'button-labels',
  })

  return buttonLabels
}

window.addEventListener('ytwl-language-changed', () => {
  buttonLabels = undefined
})

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
