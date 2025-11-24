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

export const hasPath = (url: string | null, search: string): boolean => {
  if (!url) return false

  try {
    return new URL(url).pathname === search
  } catch (e) {
    return url === search
  }
}

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    // Check for regular video format: ?v=<id>
    if (urlObj.searchParams.has('v')) {
      return true
    }
    // Check for Shorts format: /shorts/<id>
    if (urlObj.pathname.startsWith('/shorts/')) {
      return true
    }
    return false
  } catch (e) {
    // Fallback: check if URL string contains ?v= or /shorts/
    return url.includes('?v=') || url.includes('/shorts/')
  }
}

export const extractVideoId = (url: string): string | null => {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    // Try to extract from query param first: ?v=<id>
    const videoIdFromQuery = urlObj.searchParams.get('v')
    if (videoIdFromQuery) {
      return videoIdFromQuery
    }
    // Try to extract from pathname: /shorts/<id>
    const pathname = urlObj.pathname
    if (pathname.startsWith('/shorts/')) {
      // Extract video ID from pathname, handling additional path segments
      // Match everything after /shorts/ up to the next / or end of string
      const match = pathname.match(/^\/shorts\/([^/]+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  } catch (e) {
    // Fallback: try to extract from URL string
    // Try ?v= format
    const vMatch = url.match(/[?&]v=([^&]+)/)
    if (vMatch && vMatch[1]) {
      return vMatch[1]
    }
    // Try /shorts/ format
    const shortsMatch = url.match(/\/shorts\/([^/?]+)/)
    if (shortsMatch && shortsMatch[1]) {
      return shortsMatch[1]
    }
    return null
  }
}
