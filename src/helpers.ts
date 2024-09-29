import { Storage } from '@plasmohq/storage'

export const loggingEnabled = async (): Promise<boolean> => {
  const storage = new Storage()
  const isLogging: boolean = await storage.get('isLogging')
  return isLogging
}

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

export const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0])
    })
  })
}

export const openTab = async (url: string) => chrome.tabs.create({ url })
