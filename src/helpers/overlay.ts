import { getVideoId } from '~helpers/extracting'
import { elementNeedsButton } from '~helpers/matching'

export const previewOverlayAnchorSelectors = [
  // General thumbnail cards
  'ytd-rich-item-renderer',
  // Videos on playlist page
  'ytd-playlist-video-renderer',
  // Videos on search page
  'ytd-search ytd-video-renderer',
  // Suggested videos next to video player
  '.yt-lockup-view-model',
  '.ytLockupViewModelHost',
]

export const previewOverlayAnchorSelector =
  previewOverlayAnchorSelectors.join(',')

export const removeNestedOverlayAnchors = (elements: Element[]) =>
  elements.filter((element) => {
    const closestOverlayParent = element.parentElement?.closest(
      previewOverlayAnchorSelector,
    )

    return !closestOverlayParent || !elements.includes(closestOverlayParent)
  })

export const elementIsVisible = (element: Element) => {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)

  if (style.display === 'none') return false
  if (style.visibility === 'hidden') return false
  if (style.opacity === '0') return false
  if (rect.width === 0 && rect.height === 0 && style.overflow !== 'hidden') {
    return false
  }

  return rect.x + rect.width >= 0 && rect.y + rect.height >= 0
}

export const getOverlayAnchorElements = () => {
  const elements = document.querySelectorAll(previewOverlayAnchorSelector)

  return removeNestedOverlayAnchors(Array.from(elements))
    .filter((element) => elementIsVisible(element))
    .filter((element) => elementNeedsButton(element))
    .filter((element) => !element.querySelector('.watch-later-btn'))
}

const overlayAnchorElementIds = new WeakMap<Element, number>()
let overlayAnchorElementId = 0

export const getOverlayAnchorElementId = (element: Element) => {
  const existingId = overlayAnchorElementIds.get(element)

  if (existingId) return existingId

  overlayAnchorElementId += 1
  overlayAnchorElementIds.set(element, overlayAnchorElementId)
  return overlayAnchorElementId
}

export const getOverlayAnchorSignature = (elements: Element[]) =>
  elements
    .map(
      (element) =>
        `${getOverlayAnchorElementId(element)}:${getVideoId(element) || ''}`,
    )
    .join('|')

// YouTube's DOM churns constantly; only refresh anchors when a mutation actually adds/removes one.
export const mutationsAffectOverlayAnchors = (mutations: MutationRecord[]) =>
  mutations.some((mutation) =>
    [...mutation.addedNodes, ...mutation.removedNodes].some(
      (node) =>
        node instanceof Element &&
        (node.matches(previewOverlayAnchorSelector) ||
          node.querySelector(previewOverlayAnchorSelector) !== null),
    ),
  )
