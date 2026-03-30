import { extractVideoId, isVideoUrl } from '~helpers/browser'
import {
  elementIsAnchor,
  elementIsInMobilePlayerSuggested,
  elementIsOnVideoDetailPage,
} from '~helpers/matching'

export const getVideoId = (element: Element) => {
  if (elementIsOnVideoDetailPage(element)) {
    return extractVideoId(window.location.href)
  }
  if (elementIsInMobilePlayerSuggested(element)) {
    return extractVideoId(getMobileSuggestedMenuHref(element))
  }
  if (elementIsAnchor(element)) {
    return extractVideoId((element as HTMLAnchorElement).href)
  }
  return extractVideoId(element.querySelector('a')?.href)
}

export const getMobileSuggestedMenuHref = (element: Element) =>
  element.closest('ytm-media-item')?.querySelector('a')?.href || ''
