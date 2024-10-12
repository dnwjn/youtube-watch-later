import { Storage } from '@plasmohq/storage'

export const loggingEnabled = async (): Promise<boolean> => {
  const storage = new Storage()
  const isLogging: boolean = await storage.get('isLogging')
  return isLogging
}

export const logLine = async (
  message: string,
  optionalParams: any[] = [],
  _loggingEnabled: boolean | null = null,
) => {
  if (_loggingEnabled === true || (await loggingEnabled())) {
    console.log(`[YT Watch Later] ${message}`, ...optionalParams)
  }
}

export const logError = async (
  message: string,
  optionalParams: any[] = [],
  _loggingEnabled: boolean | null = null,
) => {
  if (_loggingEnabled === true || (await loggingEnabled())) {
    console.error(`[YT Watch Later] ${message}`, ...optionalParams)
  }
}