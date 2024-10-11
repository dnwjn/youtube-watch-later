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

export const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0])
    })
  })
}

export const openTab = async (url: string) => chrome.tabs.create({ url })

export const getElementXPath = (element) => {
  if (element.id) {
    return '//*[@id="' + element.id + '"]'
  }

  if (element === document.body) {
    return '/html/body'
  }

  let ix = 0
  const siblings = element.parentNode.childNodes

  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i]
    
    if (sibling === element) {
      return (
        getElementXPath(element.parentNode) +
        '/' +
        element.tagName.toLowerCase() +
        '[' +
        (ix + 1) +
        ']'
      )
    }

    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++
    }
  }
}
