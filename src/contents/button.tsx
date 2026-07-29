import type {
  PlasmoCSConfig,
  PlasmoCSUIWatch,
  PlasmoGetInlineAnchorList,
  PlasmoGetOverlayAnchorList,
  PlasmoGetStyle,
  PlasmoMountShadowHost,
  PlasmoWatchOverlayAnchor,
} from 'plasmo'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import WatchLaterIcon from '~components/WatchLaterIcon'
import { addToWatchLater, markNotificationAsRead } from '~helpers/api'
import { hasPath, hasSearch } from '~helpers/browser'
import { getVideoId } from '~helpers/extracting'
import {
  elementIsInEndscreenSuggested,
  elementIsInMobilePlayerSuggested,
  elementIsInModernEndscreenSuggested,
  elementIsInNotification,
  elementIsInPlayerSuggested,
  elementIsInPlaylist,
  elementIsInThumbnail,
  elementIsOnVideoDetailPage,
  elementNeedsButton,
} from '~helpers/matching'
import {
  computeOverlayButtonStyle,
  getOverlayAnchorElements,
  previewOverlayAnchorSelector,
  watchOverlayEviction,
} from '~helpers/overlay'
import { getSettings } from '~helpers/system'
import useOverlayAlignmentGuard from '~hooks/useOverlayAlignmentGuard'
import useVideoPreviewListener from '~hooks/useVideoPreviewListener'
import type { ButtonConfig, Settings, YTData } from '~interfaces'
import { useWatchLaterStore } from '~store'
import {
  ButtonOpacity,
  ButtonPosition,
  ButtonPositionContext,
  ButtonStatus,
  ButtonVisibility,
} from '~types'

import { buttonStyles } from './button.styles'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  all_frames: true,
  world: 'MAIN',
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = buttonStyles
  return style
}

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

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = document.querySelectorAll(anchorListSelectors.join(','))

  return (
    Array.from(elements)
      // Filter out elements that already have the button.
      .filter((element) => !element.querySelector('.watch-later-btn'))
      // Thumbnail cards are mounted through the overlay API so they can sit
      // above YouTube's global hover-preview player.
      .filter(
        (element) =>
          !element.matches(previewOverlayAnchorSelector) &&
          !elementIsInThumbnail(element) &&
          !elementIsInPlaylist(element),
      )
      // Filter out elements that are not a video.
      .filter((element) => elementNeedsButton(element))
      .map((element) => ({
        element,
        insertPosition: 'beforebegin',
      }))
  )
}

export const getOverlayAnchorList: PlasmoGetOverlayAnchorList = async () => {
  return getOverlayAnchorElements() as unknown as NodeList
}

export const watch: PlasmoCSUIWatch = ({ observer }) =>
  watchOverlayEviction(observer)

export const watchOverlayAnchor: PlasmoWatchOverlayAnchor = (
  updatePosition,
) => {
  // Right after a (re)mount YouTube may still be laying out the swapped-in
  // content, so track the anchor at frame rate for a short burst before
  // dropping to the slow interval - otherwise the container sits at a stale
  // position for up to 250ms.
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

export const mountShadowHost: PlasmoMountShadowHost = ({
  shadowHost,
  anchor,
  mountState,
}) => {
  const element = anchor.element

  if (anchor.type === 'overlay') {
    shadowHost.classList.add('ytwl-overlay-root')
    const overlayRoot = document.body || document.documentElement
    overlayRoot.appendChild(shadowHost)
  } else if (elementIsInMobilePlayerSuggested(element)) {
    element.appendChild(shadowHost)
  } else if (elementIsInThumbnail(element)) {
    // Mount inside the thumbnail image wrapper (rather than the whole video
    // card) so absolute positioning is relative to the thumbnail itself, not
    // the card including the title/channel metadata below it.
    const thumbnail = element.querySelector(
      'ytd-thumbnail, yt-thumbnail-view-model',
    )
    const mountTarget = thumbnail ?? element
    mountTarget.insertBefore(shadowHost, mountTarget.firstChild)
  } else {
    element.insertBefore(shadowHost, element.firstChild)
  }

  // Deliberate: this kills Plasmo's own MutationObserver, whose callback
  // runs a full-page anchor scan on every DOM mutation - a constant cost on
  // YouTube's ever-churning DOM. Plasmo's 142ms interval keeps running and
  // is what picks up new anchors and rebuilds the overlay host after our
  // `watch` evicts it. Don't "fix" this by reconnecting the observer.
  mountState.observer.disconnect()
}

const computeButtonConfig = (
  settings: Settings,
  positionContext: string | null,
  previous: ButtonConfig,
): ButtonConfig => {
  const position = positionContext
    ? (settings[positionContext as keyof Settings] as string)
    : null

  return {
    opacity: settings.buttonOpacity || previous.opacity,
    position: position || previous.position,
    visibility: settings.buttonVisibility || previous.visibility,
  }
}

// `ytData`/`enabled` live in one page-wide store and, once ytData is set, no
// further button instance attaches nav listeners (see `init` below) - so a
// single button instance ends up "owning" them. That owner can easily be an
// overlay button, which gets torn down on every YouTube navigation, taking
// the only nav listeners with it and leaving `enabled` stuck at `false`.
// Handling navigation here instead, at module scope, means it survives every
// individual button mounting and unmounting.
const handleGlobalNavigateStart = () => {
  useWatchLaterStore.getState().setEnabled(false)
}

const handleGlobalNavigateFinish = (event: CustomEvent) => {
  const newUrl = event.detail?.response?.url as string | null
  const { ytData, setUrl, setEnabled } = useWatchLaterStore.getState()

  setUrl(newUrl)
  if (ytData) setEnabled(ytData.loggedIn === true)
}

window.addEventListener('ytwl-yt-nav-start', handleGlobalNavigateStart)
window.addEventListener(
  'ytwl-yt-nav-finish',
  handleGlobalNavigateFinish as EventListener,
)

const WatchLaterButton = ({ anchor }) => {
  const { element } = anchor
  const isOverlay = anchor.type === 'overlay'

  useVideoPreviewListener()

  const {
    ytData,
    url,
    enabled,
    latestElementRef,
    videoPreviewIsHovered,
    addedVideoIds,
    pendingVideoIds,
    erroredVideoIds,
    setYtData,
    setEnabled,
    setLatestElementRef,
    markVideoAsPending,
    markVideoAsAdded,
    markVideoAsErrored,
    clearVideoError,
  } = useWatchLaterStore()

  const [status, setStatus] = useState<number>(ButtonStatus.Hidden)
  const [visible, setVisible] = useState<boolean>(false)
  const [hasData, setHasData] = useState<boolean>(false)
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig>({
    opacity: ButtonOpacity.Full,
    position: ButtonPosition.TopLeft,
    visibility: ButtonVisibility.Always,
  })
  const [configLoaded, setConfigLoaded] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isInThumbnail = elementIsInThumbnail(element)
  const isInPlaylist = elementIsInPlaylist(element)
  const isInNotification = elementIsInNotification(element)
  const isInEndscreenSuggested = elementIsInEndscreenSuggested(element)
  const isInModernEndscreenSuggested =
    elementIsInModernEndscreenSuggested(element)
  const isOnVideoDetail = elementIsOnVideoDetailPage(element)
  const isInPlayerSuggested = elementIsInPlayerSuggested(element)
  const isInPlayerSuggestedMobile = elementIsInMobilePlayerSuggested(element)
  const usesThumbnailButtonStyle = isInThumbnail || (isOverlay && !isInPlaylist)
  const videoId = useMemo(() => getVideoId(element), [element])

  let positionContext: string | null = null
  if (isInPlaylist) positionContext = ButtonPositionContext.Playlist
  else if (isInModernEndscreenSuggested)
    positionContext = ButtonPositionContext.EndscreenModern
  else if (isInEndscreenSuggested)
    positionContext = ButtonPositionContext.Endscreen
  else if (isInPlayerSuggested) positionContext = ButtonPositionContext.Sidebar
  else if (isInNotification)
    positionContext = ButtonPositionContext.Notification
  else if (isInThumbnail) positionContext = ButtonPositionContext.Thumbnail

  const buttonClasses = useMemo(() => {
    const classes = ['watch-later-btn']

    if (buttonConfig.opacity) {
      classes.push(buttonConfig.opacity)
    }
    if (buttonConfig.position) {
      classes.push(buttonConfig.position)
    }

    if (usesThumbnailButtonStyle) {
      classes.push('in-thumbnail')
    }
    if (isInPlaylist) {
      classes.push('in-playlist')
    }
    if (isInNotification) {
      classes.push('in-notification')

      if (element.offsetHeight < 100) {
        classes.push('spaced')
      }
    }
    if (isInEndscreenSuggested) {
      classes.push('in-endscreen-suggested')
    }
    if (isInModernEndscreenSuggested) {
      classes.push('in-mod-endscreen-suggested')
    }
    if (isOnVideoDetail) {
      classes.push('on-video-detail')
    }
    if (isInPlayerSuggested) {
      classes.push('in-player-suggested')
    }
    if (isInPlayerSuggestedMobile) {
      classes.push('in-player-suggested-mobile')
    }
    if (isOverlay) {
      classes.push('floating-preview')
    }

    if (ytData?.clientTheme === 'USER_INTERFACE_THEME_DARK') {
      classes.push('dark')
    }
    if (ytData?.clientTheme === 'USER_INTERFACE_THEME_LIGHT') {
      classes.push('light')
    }

    if (status === ButtonStatus.Loading) {
      classes.push('loading')
    }
    if (status === ButtonStatus.Success) {
      classes.push('success')
    }
    if (status === ButtonStatus.Error) {
      classes.push('error')
    }

    return classes.join(' ')
  }, [
    status,
    ytData?.clientTheme,
    buttonConfig,
    element.offsetHeight,
    usesThumbnailButtonStyle,
    isInPlaylist,
    isInNotification,
    isInEndscreenSuggested,
    isInModernEndscreenSuggested,
    isOnVideoDetail,
    isInPlayerSuggested,
    isInPlayerSuggestedMobile,
    isOverlay,
  ])

  const shouldShow = useMemo(() => {
    if (!configLoaded) return false
    if (status === ButtonStatus.Hidden) return false
    if (isOnVideoDetail) return true // Always show on video detail page
    if (buttonConfig.visibility === ButtonVisibility.Always) return true
    if (isHovered) return true
    if (videoPreviewIsHovered && latestElementRef === element) return true
    return false
  }, [
    configLoaded,
    status,
    buttonConfig,
    isHovered,
    videoPreviewIsHovered,
    latestElementRef,
    isOnVideoDetail,
    element,
  ])

  useOverlayAlignmentGuard(isOverlay, element, buttonRef)

  const fetchButtonConfig = async () => {
    const settings = await getSettings()
    setButtonConfig((previous) =>
      computeButtonConfig(settings, positionContext, previous),
    )
    setConfigLoaded(true)
  }

  const handleSettingsChanged = (event) => {
    const settings = event.detail as Settings
    setButtonConfig((previous) =>
      computeButtonConfig(settings, positionContext, previous),
    )
  }

  const overlayButtonStyle = useMemo<React.CSSProperties | undefined>(
    () =>
      isOverlay
        ? computeOverlayButtonStyle(element, buttonConfig.position)
        : undefined,
    [buttonConfig.position, element, isOverlay],
  )

  const addVideo = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (status !== ButtonStatus.Default) return

    if (videoId && ytData) {
      setStatus(ButtonStatus.Loading)
      markVideoAsPending(videoId)

      addToWatchLater(ytData, videoId)
        .then(() => {
          markVideoAsAdded(videoId)
          setStatus(ButtonStatus.Success)

          if (isInNotification) {
            markNotificationAsRead(ytData, element)
          }
        })
        .catch(() => {
          markVideoAsErrored(videoId)
          setStatus(ButtonStatus.Error)
          setTimeout(() => {
            clearVideoError(videoId)
            setStatus(ButtonStatus.Default)
          }, 2000)
        })
    }
  }

  const onElementMouseEnter = () => {
    setIsHovered(true)
    setLatestElementRef(element)
  }

  const onElementMouseLeave = () => {
    setIsHovered(false)
  }

  const setYtwlYt = (event) => {
    if (ytData) return

    const newYtData = event.detail as YTData | null

    if (newYtData) {
      setYtData(newYtData)
      window.removeEventListener('ytwl-yt', setYtwlYt)
      setHasData(true)
    } else {
      setHasData(false)
    }
  }

  const setEnabledFromYtData = useCallback(() => {
    const currentYtData = useWatchLaterStore.getState().ytData
    if (currentYtData) {
      setEnabled(currentYtData.loggedIn === true)
    }
  }, [setEnabled])

  const init = () => {
    element.addEventListener('mouseenter', onElementMouseEnter)
    element.addEventListener('mouseleave', onElementMouseLeave)

    setEnabledFromYtData()
    fetchButtonConfig()
    window.addEventListener('ytwl-settings-changed', handleSettingsChanged)

    if (ytData) {
      setHasData(true)
      return
    }

    window.addEventListener('ytwl-yt', setYtwlYt)

    window.dispatchEvent(new CustomEvent('ytwl-yt-req'))
  }

  const cleanup = () => {
    element.removeEventListener('mouseenter', onElementMouseEnter)
    element.removeEventListener('mouseleave', onElementMouseLeave)

    window.removeEventListener('ytwl-yt', setYtwlYt)
    window.removeEventListener('ytwl-settings-changed', handleSettingsChanged)
  }

  useEffect(() => {
    setEnabledFromYtData()
  }, [ytData, setEnabledFromYtData])

  useEffect(() => {
    const isWL = hasSearch(url, 'list', 'WL')
    const isPlaylists = hasPath(url, '/feed/playlists')

    if (
      !enabled ||
      (!isInNotification && !isOnVideoDetail && (isWL || isPlaylists))
    ) {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [enabled, isInNotification, isOnVideoDetail, url])

  useEffect(() => {
    if (visible && hasData) {
      if (videoId && addedVideoIds.has(videoId)) {
        setStatus(ButtonStatus.Success)
      } else if (videoId && erroredVideoIds.has(videoId)) {
        setStatus(ButtonStatus.Error)
      } else if (videoId && pendingVideoIds.has(videoId)) {
        setStatus(ButtonStatus.Loading)
      } else {
        setStatus(ButtonStatus.Default)
      }
    } else {
      setStatus(ButtonStatus.Hidden)
    }
  }, [
    visible,
    hasData,
    videoId,
    addedVideoIds,
    pendingVideoIds,
    erroredVideoIds,
  ])

  // init/cleanup close over per-render state (ytData, url, positionContext, ...)
  // but this effect must only run once on mount, so the latest versions are
  // tracked in refs rather than added as effect dependencies.
  const initRef = useRef(init)
  const cleanupRef = useRef(cleanup)
  initRef.current = init
  cleanupRef.current = cleanup

  useEffect(() => {
    const handlePopState = () => {
      cleanupRef.current()
      setTimeout(() => initRef.current(), 100)
    }

    initRef.current()
    window.addEventListener('popstate', handlePopState)

    return () => {
      cleanupRef.current()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!shouldShow) return null

  // Overlay buttons start hidden; useOverlayAlignmentGuard owns `visibility`
  // from here via direct DOM writes. React never changes this key between
  // renders, so it won't clobber the guard's writes.
  const buttonStyle = isOverlay
    ? { ...overlayButtonStyle, visibility: 'hidden' as const }
    : overlayButtonStyle

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      disabled={status !== ButtonStatus.Default}
      onClick={addVideo}
      style={buttonStyle}>
      <WatchLaterIcon status={status} />
    </button>
  )
}

export default WatchLaterButton
