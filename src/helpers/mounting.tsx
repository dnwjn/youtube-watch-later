import React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import WatchLaterButton from '~/components/WatchLaterButton'
import { buttonStyles } from '~/helpers/button.styles'
import {
  elementIsInMobilePlayerSuggested,
  elementIsInPlaylist,
  elementIsInThumbnail,
  elementNeedsButton,
} from '~/helpers/matching'
import {
  getOverlayAnchorElements,
  previewOverlayAnchorSelector,
  watchOverlayEviction,
} from '~/helpers/overlay'
import type { ButtonAnchor } from '~/interfaces'

const MOUNT_INTERVAL_MS = 142

const anchorListSelectors = [
  // General videos
  'ytd-rich-item-renderer',
  // Videos on playlist page
  'ytd-playlist-video-renderer',
  // Videos in notification drawer
  'ytd-notification-renderer',
  // Videos on search page
  'ytd-search ytd-video-renderer',
  // Suggested videos in video player when finished
  '.ytp-endscreen-content .ytp-videowall-still',
  '.ytp-fullscreen-grid .ytp-modern-videowall-still',
  // Buttons below video player
  'ytd-watch-metadata #top-level-buttons-computed',
  // Suggested videos next to video player
  'yt-lockup-view-model.ytd-item-section-renderer > .yt-lockup-view-model',
  // Suggested videos next to video player (new classname since May 2026)
  'yt-lockup-view-model.ytd-item-section-renderer > .ytLockupViewModelHost',
  // Suggested videos below video player on mobile
  'ytm-media-item .media-item-menu',
]

const getInlineAnchorElements = () =>
  Array.from(document.querySelectorAll(anchorListSelectors.join(',')))
    // Filter out elements that already have the button.
    .filter((element) => !element.querySelector('.watch-later-btn'))
    // Thumbnail cards are mounted through the overlay so they can sit above
    // YouTube's global hover-preview player.
    .filter(
      (element) =>
        !element.matches(previewOverlayAnchorSelector) &&
        !elementIsInThumbnail(element) &&
        !elementIsInPlaylist(element),
    )
    // Filter out elements that are not a video.
    .filter((element) => elementNeedsButton(element))

const getOverlayAnchors = async () => {
  let elements = getOverlayAnchorElements()

  // YouTube's own hover-preview player briefly detaches/reattaches the feed
  // during layout, which can make every anchor selector miss for a single
  // poll tick even though nothing actually changed. Treating that as "no
  // anchors" tears down and rebuilds every mounted button (visible as
  // flicker), so re-check after a frame before trusting an empty result.
  if (elements.length === 0) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
    elements = getOverlayAnchorElements()
  }

  return elements
}

const createShadowHost = () => {
  const host = document.createElement('ytwl-button-host')
  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = buttonStyles
  shadow.appendChild(style)

  const shadowContainer = document.createElement('div')
  shadowContainer.id = 'ytwl-shadow-container'
  shadow.appendChild(shadowContainer)

  return { host, shadowContainer }
}

const renderButton = (container: Element, anchor: ButtonAnchor): Root => {
  const root = createRoot(container)
  root.render(<WatchLaterButton anchor={anchor} />)

  return root
}

type InlineMount = { element: Element; host: HTMLElement; root: Root }

const mountInline = (element: Element): InlineMount => {
  const { host, shadowContainer } = createShadowHost()

  const container = document.createElement('div')
  container.className = 'ytwl-csui-container'
  shadowContainer.appendChild(container)

  if (elementIsInMobilePlayerSuggested(element)) {
    element.appendChild(host)
  } else if (elementIsInThumbnail(element)) {
    // Mount inside the thumbnail image wrapper (rather than the whole video
    // card) so absolute positioning is relative to the thumbnail itself, not
    // the card including the title/channel metadata below it.
    const thumbnail = element.querySelector(
      'ytd-thumbnail, yt-thumbnail-view-model',
    )
    const mountTarget = thumbnail ?? element
    mountTarget.insertBefore(host, mountTarget.firstChild)
  } else {
    element.insertBefore(host, element.firstChild)
  }

  return {
    element,
    host,
    root: renderButton(container, {
      element: element as HTMLElement,
      type: 'inline',
    }),
  }
}

// Right after a (re)mount YouTube may still be laying out the swapped-in
// content, so the container tracks its anchor at frame rate for a short burst
// before dropping to a slow interval - otherwise it would sit at a stale
// position for up to 250ms.
const trackAnchor = (element: Element, container: HTMLElement) => {
  const updatePosition = () => {
    const rect = element.getBoundingClientRect()

    container.style.left = `${rect.left + window.scrollX}px`
    container.style.top = `${rect.top + window.scrollY}px`
    container.style.width = `${rect.width}px`
    container.style.height = `${rect.height}px`
  }

  let burstFramesLeft = 30
  let rafId = 0

  const burst = () => {
    updatePosition()
    burstFramesLeft -= 1
    if (burstFramesLeft > 0) rafId = requestAnimationFrame(burst)
  }
  rafId = requestAnimationFrame(burst)

  const interval = setInterval(updatePosition, 250)

  return () => {
    cancelAnimationFrame(rafId)
    clearInterval(interval)
  }
}

type OverlayMount = { host: HTMLElement; teardown: () => void }

const mountOverlay = (elements: Element[]): OverlayMount => {
  const { host, shadowContainer } = createShadowHost()
  host.classList.add('ytwl-overlay-root')

  const teardowns = elements.map((element) => {
    const container = document.createElement('div')
    container.className = 'ytwl-csui-container'
    shadowContainer.appendChild(container)

    const stopTracking = trackAnchor(element, container)
    const root = renderButton(container, {
      element: element as HTMLElement,
      type: 'overlay',
    })

    return () => {
      stopTracking()
      root.unmount()
    }
  })

  const overlayRoot = document.body || document.documentElement
  overlayRoot.appendChild(host)

  return {
    host,
    teardown: () => {
      teardowns.forEach((teardown) => teardown())
      host.remove()
    },
  }
}

// Polls for anchors instead of observing the DOM: a mutation observer would
// run a full-page anchor scan on every mutation, a constant cost on YouTube's
// ever-churning DOM. Don't "fix" this by switching to an observer.
export const startMounting = () => {
  const inlineMounts = new Set<InlineMount>()
  let overlay: OverlayMount | null = null
  let ticking = false

  const evictOverlay = () => {
    overlay?.teardown()
    overlay = null
  }

  const tick = async () => {
    if (ticking) return
    ticking = true

    try {
      inlineMounts.forEach((mount) => {
        if (mount.element.isConnected) return

        mount.root.unmount()
        mount.host.remove()
        inlineMounts.delete(mount)
      })

      getInlineAnchorElements().forEach((element) => {
        inlineMounts.add(mountInline(element))
      })

      if (!overlay) {
        const elements = await getOverlayAnchors()

        if (elements.length > 0 && !overlay) overlay = mountOverlay(elements)
      }
    } finally {
      ticking = false
    }
  }

  const interval = setInterval(tick, MOUNT_INTERVAL_MS)
  const stopWatching = watchOverlayEviction(evictOverlay)

  return () => {
    clearInterval(interval)
    stopWatching()
    evictOverlay()
    inlineMounts.forEach((mount) => {
      mount.root.unmount()
      mount.host.remove()
    })
    inlineMounts.clear()
  }
}
