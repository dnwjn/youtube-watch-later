import type { PlasmoCSUIWatch } from 'plasmo'
import type { CSSProperties } from 'react'

import { elementNeedsButton } from '~helpers/matching'
import { ButtonPosition } from '~types'

type CSUIObserver = Parameters<PlasmoCSUIWatch>[0]['observer']

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

// Only inspects the nodes a mutation actually touched, not the whole page, so
// it's cheap enough to run on every mutation without re-scanning the DOM.
export const mutationsAffectOverlayAnchors = (mutations: MutationRecord[]) =>
  mutations.some((mutation) =>
    [...mutation.addedNodes, ...mutation.removedNodes].some(
      (node) =>
        node instanceof Element &&
        (node.matches(previewOverlayAnchorSelector) ||
          node.querySelector(previewOverlayAnchorSelector) !== null),
    ),
  )

const OVERLAY_EVICTION_DEBOUNCE_MS = 200

// Plasmo only (re-)renders the overlay host when it doesn't exist yet — once
// mounted, its own mutation/interval loop keeps recomputing the anchor list
// but never re-renders it. Evicting the host forces Plasmo's already-running
// loop to rebuild it with the fresh anchor list on its next pass, instead of
// leaving buttons stuck on stale (often removed) anchors.
//
// This needs to happen both on YouTube navigation and on plain DOM churn
// (e.g. switching the sidebar between Up next/Related/Chapters swaps its
// content without a navigation event). The mutation check only ever looks at
// the nodes a given mutation touched, not the page, so it stays cheap even
// though it runs on every mutation.
export const watchOverlayEviction = (observer: CSUIObserver) => {
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  const evictOverlayHost = () => {
    const overlayHost = Array.from(observer.mountState.hostSet).find(
      (host) => observer.mountState.hostMap.get(host)?.type === 'overlay',
    )
    if (!overlayHost) return

    const overlayAnchor = observer.mountState.hostMap.get(overlayHost)
    overlayAnchor?.root?.unmount()
    overlayHost.remove()
    observer.mountState.hostSet.delete(overlayHost)
    observer.mountState.hostMap.delete(overlayHost)
  }

  const scheduleEviction = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(evictOverlayHost, OVERLAY_EVICTION_DEBOUNCE_MS)
  }

  const mutationObserver = new MutationObserver((mutations) => {
    if (mutationsAffectOverlayAnchors(mutations)) scheduleEviction()
  })
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  window.addEventListener('ytwl-yt-nav-finish', evictOverlayHost)

  return () => {
    mutationObserver.disconnect()
    if (debounceTimeout) clearTimeout(debounceTimeout)
    window.removeEventListener('ytwl-yt-nav-finish', evictOverlayHost)
  }
}

// Positions an overlay button within its card-aligned container. Measures the
// thumbnail sub-element, not the whole card, so `right`/`bottom` resolve
// correctly and the button doesn't land over the title/channel text.
export const computeOverlayButtonStyle = (
  element: Element,
  position: string,
): CSSProperties | undefined => {
  const cardRect = element.getBoundingClientRect()
  const thumbnail = element.querySelector(
    'ytd-thumbnail, yt-thumbnail-view-model',
  )
  const thumbnailRect = thumbnail?.getBoundingClientRect() ?? cardRect

  if (thumbnailRect.width <= 0 || thumbnailRect.height <= 0) {
    return undefined
  }

  const offsetX = thumbnailRect.left - cardRect.left
  const offsetY = thumbnailRect.top - cardRect.top

  const isLeft =
    position === ButtonPosition.TopLeft ||
    position === ButtonPosition.BottomLeft
  const isTop =
    position === ButtonPosition.TopLeft || position === ButtonPosition.TopRight

  return {
    left: isLeft
      ? `${Math.round(offsetX + 5)}px`
      : `${Math.max(5, Math.round(offsetX + thumbnailRect.width - 39))}px`,
    right: 'unset',
    top: isTop
      ? `${Math.round(offsetY + 4)}px`
      : `${Math.max(4, Math.round(offsetY + thumbnailRect.height - 38))}px`,
    bottom: 'unset',
  }
}
