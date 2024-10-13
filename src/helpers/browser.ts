export const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0])
    })
  })
}

export const openTab = async (url: string) => chrome.tabs.create({ url })

export const hasSearch = (
  url: string | null,
  search: string,
  value: string,
): boolean => {
  if (!url) return false

  const [, searchParams] = url.split('?')

  if (!searchParams) return false

  return new URLSearchParams(searchParams).get(search) === value
}
