import { isVideoUrl } from '~helpers/browser'
import { getMobileSuggestedMenuHref } from '~helpers/extracting'

export const elementIsAnchor = (element: Element) => element.tagName === 'A'

export const elementIsInThumbnail = (element: Element) =>
  [
    'YTD-RICH-ITEM-RENDERER',
    'YTD-GRID-VIDEO-RENDERER',
    'YTD-VIDEO-RENDERER',
  ].includes(element.tagName)

export const elementIsInPlaylist = (element: Element) =>
  ['YTD-PLAYLIST-VIDEO-RENDERER'].includes(element.tagName)

export const elementIsInNotification = (element: Element) =>
  ['YTD-NOTIFICATION-RENDERER'].includes(element.tagName)

export const elementIsInEndscreenSuggested = (element: Element) =>
  element.classList.contains('ytp-videowall-still')

export const elementIsInModernEndscreenSuggested = (element: Element) =>
  element.classList.contains('ytp-modern-videowall-still')

export const elementIsInPlayerSuggested = (element: Element) =>
  element.classList.contains('yt-lockup-view-model')
  || element.classList.contains('ytLockupViewModelHost')

export const elementIsInMobilePlayerSuggested = (element: Element) =>
  element.classList.contains('media-item-menu')

export const elementIsOnVideoDetailPage = (element: Element) =>
  element.id === 'top-level-buttons-computed'

export const elementNeedsButton = (element: Element) => {
  if (elementIsAnchor(element)) {
    return isVideoUrl((element as HTMLAnchorElement).href)
  }

  // For video detail page, check if we're on a watch page or shorts page.
  if (elementIsOnVideoDetailPage(element)) {
    return window.location.pathname.match(/^\/(watch|shorts)/)
  }

  // For suggested videos on mobile player page, we need to find the anchor higher up in the hierarchy.
  if (elementIsInMobilePlayerSuggested(element)) {
    return isVideoUrl(getMobileSuggestedMenuHref(element))
  }

  return Array.from(element.querySelectorAll('a')).some((a) =>
    isVideoUrl(a.href),
  )
}
