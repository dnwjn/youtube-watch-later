import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import type { Settings } from '~interfaces'

import { loggingEnabled } from './system'

export const logLine = async (message: string, ...optionalParams: any[]) => {
  if (await loggingEnabled()) {
    console.log(`[YT Watch Later] ${message}`, ...optionalParams)
  }
}

export const logError = async (message: string, ...optionalParams: any[]) => {
  if (await loggingEnabled()) {
    console.error(`[YT Watch Later] ${message}`, ...optionalParams)
  }
}
