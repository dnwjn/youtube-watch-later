import { loggingEnabled } from './system'

export const logLine = async (message: string, ...optionalParams: any[]) => {
  if (await loggingEnabled()) {
    console.log(`[YouTube Watch Later] ${message}`, ...optionalParams)
  }
}

export const logError = async (message: string, ...optionalParams: any[]) => {
  if (await loggingEnabled()) {
    console.error(`[YouTube Watch Later] ${message}`, ...optionalParams)
  }
}
