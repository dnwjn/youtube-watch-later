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

import { getAuthorizationHeader, getHostname } from '~helpers/api'
import { hasPath, hasSearch } from '~helpers/browser'
import { getVideoId } from '~helpers/extracting'
import { logError, logLine } from '~helpers/logging'
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
  getOverlayAnchorElements,
  getOverlayAnchorSignature,
  mutationsAffectOverlayAnchors,
  previewOverlayAnchorSelector,
} from '~helpers/overlay'
import { getSettings, markNotificationsAsRead } from '~helpers/system'
import useVideoPreviewListener from '~hooks/useVideoPreviewListener'
import type { ButtonConfig, Settings, YTData } from '~interfaces'
import { useWatchLaterStore } from '~store'
import {
  ButtonOpacity,
  ButtonPosition,
  ButtonPositionContext,
  ButtonVisibility,
} from '~types'

import { buttonStyles } from './button.styles'

let inlineAnchorListInterval: ReturnType<typeof setInterval> | null = null
let lastOverlayAnchorSignature = ''
let overlayAnchorRefreshInFlight = false

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

const OVERLAY_REFRESH_DEBOUNCE_MS = 200
const OVERLAY_REFRESH_FALLBACK_INTERVAL_MS = 2000

export const watch: PlasmoCSUIWatch = ({ observer, render }) => {
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  const refreshOverlayAnchors = async () => {
    if (overlayAnchorRefreshInFlight || observer.mountState.isMounting) return

    overlayAnchorRefreshInFlight = true

    try {
      const elements = getOverlayAnchorElements()
      const signature = getOverlayAnchorSignature(elements)
      const overlayHost = Array.from(observer.mountState.hostSet).find(
        (host) => observer.mountState.hostMap.get(host)?.type === 'overlay',
      )

      if (signature === lastOverlayAnchorSignature && overlayHost) return

      lastOverlayAnchorSignature = signature
      observer.mountState.overlayTargetList = elements

      if (overlayHost) {
        const overlayAnchor = observer.mountState.hostMap.get(overlayHost)

        overlayAnchor?.root?.unmount()
        overlayHost.remove()
        observer.mountState.hostSet.delete(overlayHost)
        observer.mountState.hostMap.delete(overlayHost)
      }

      if (elements.length > 0) {
        await render({
          element: document.documentElement,
          type: 'overlay',
        })
      }
    } finally {
      overlayAnchorRefreshInFlight = false
    }
  }

  const scheduleRefresh = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(
      refreshOverlayAnchors,
      OVERLAY_REFRESH_DEBOUNCE_MS,
    )
  }

  const mutationObserver = new MutationObserver((mutations) => {
    if (mutationsAffectOverlayAnchors(mutations)) scheduleRefresh()
  })
  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  const fallbackInterval = setInterval(
    refreshOverlayAnchors,
    OVERLAY_REFRESH_FALLBACK_INTERVAL_MS,
  )

  window.addEventListener('ytwl-yt-nav-finish', refreshOverlayAnchors)
  refreshOverlayAnchors()

  return () => {
    mutationObserver.disconnect()
    clearInterval(fallbackInterval)
    if (debounceTimeout) clearTimeout(debounceTimeout)
    window.removeEventListener('ytwl-yt-nav-finish', refreshOverlayAnchors)
  }
}

export const watchOverlayAnchor: PlasmoWatchOverlayAnchor = (
  updatePosition,
) => {
  const interval = setInterval(updatePosition, 250)

  return () => clearInterval(interval)
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

const startIntervals = () => {
  inlineAnchorListInterval = setInterval(getInlineAnchorList, 2000)
}

const clearIntervals = () => {
  if (inlineAnchorListInterval) {
    clearInterval(inlineAnchorListInterval)
    inlineAnchorListInterval = null
  }
}

const Icon = ({ status }: { status: number }) => {
  if (status === 3) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    )
  }

  if (status === 4) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="with-fill">
      <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
    </svg>
  )
}

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
    setUrl,
    setEnabled,
    setLatestElementRef,
    markVideoAsPending,
    markVideoAsAdded,
    markVideoAsErrored,
    clearVideoError,
  } = useWatchLaterStore()

  /**
   * 0: Hidden
   * 1: Default
   * 2: Loading
   * 3: Success
   * 4: Error
   */
  const [status, setStatus] = useState<number>(0)
  const [visible, setVisible] = useState<boolean>(false)
  const [hasData, setHasData] = useState<boolean>(false)
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig>({
    opacity: ButtonOpacity.Full,
    position: ButtonPosition.TopLeft,
    visibility: ButtonVisibility.Always,
  })
  const [configLoaded, setConfigLoaded] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState(false)
  const [overlayPositionSettled, setOverlayPositionSettled] =
    useState(!isOverlay)
  const [overlayAnchorConnected, setOverlayAnchorConnected] = useState(
    () => !isOverlay || element.isConnected,
  )

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

    if (status === 2) {
      classes.push('loading')
    }
    if (status === 3) {
      classes.push('success')
    }
    if (status === 4) {
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
    if (isOverlay && (!overlayPositionSettled || !overlayAnchorConnected)) {
      return false
    }
    if (status === 0) return false
    if (isOnVideoDetail) return true // Always show on video detail page
    if (buttonConfig.visibility === ButtonVisibility.Always) return true
    if (isHovered) return true
    if (videoPreviewIsHovered && latestElementRef === element) return true
    return false
  }, [
    configLoaded,
    isOverlay,
    overlayPositionSettled,
    overlayAnchorConnected,
    status,
    buttonConfig,
    isHovered,
    videoPreviewIsHovered,
    latestElementRef,
    isOnVideoDetail,
    element,
  ])

  // Detached anchor -> zero rect -> Plasmo snaps the button to (0,0). Hide until reconnected.
  useEffect(() => {
    if (!isOverlay) return

    setOverlayAnchorConnected(element.isConnected)

    const interval = setInterval(() => {
      setOverlayAnchorConnected(element.isConnected)
    }, 100)

    return () => clearInterval(interval)
  }, [isOverlay, element])

  // Plasmo keys overlay containers by list index, so a swapped anchor can briefly
  // reuse the previous button's position. Hide for a couple frames until it settles.
  useEffect(() => {
    if (!isOverlay) return

    setOverlayPositionSettled(false)

    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setOverlayPositionSettled(true))
    })

    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrame) cancelAnimationFrame(secondFrame)
    }
  }, [isOverlay, element])

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

  const overlayButtonStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!isOverlay) return undefined

    // Measure the thumbnail sub-element, not the whole card, so `right`/`bottom`
    // resolve correctly and the button doesn't land over the title/channel text.
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
      buttonConfig.position === ButtonPosition.TopLeft ||
      buttonConfig.position === ButtonPosition.BottomLeft
    const isTop =
      buttonConfig.position === ButtonPosition.TopLeft ||
      buttonConfig.position === ButtonPosition.TopRight

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
  }, [buttonConfig.position, element, isOverlay])

  const addVideo = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (status !== 1) return

    if (videoId && ytData) {
      setStatus(2)
      markVideoAsPending(videoId)

      addToWatchLater(videoId)
        .then(() => {
          markVideoAsAdded(videoId)
          setStatus(3)

          if (isInNotification) {
            markNotificationAsRead()
          }
        })
        .catch(() => {
          markVideoAsErrored(videoId)
          setStatus(4)
          setTimeout(() => {
            clearVideoError(videoId)
            setStatus(1)
          }, 2000)
        })
    }
  }

  const addToWatchLater = async (videoId: string): Promise<void> => {
    const payload = {
      actions: [
        {
          action: 'ACTION_ADD_VIDEO',
          addedVideoId: videoId,
        },
      ],
      playlistId: 'WL',
    }

    try {
      const response = await _apiPost(
        'browse/edit_playlist?prettyPrint=false',
        payload,
      )
      const responseJson = await response.json()

      if (response.ok && responseJson.status === 'STATUS_SUCCEEDED') {
        logLine('Video added to Watch Later', videoId)
        return
      }

      logError('Failed to add video to Watch Later', responseJson)
    } catch (error) {
      logError('Failed to add video to Watch Later', error)
    }

    throw new Error('Failed to add video to Watch Later')
  }

  const markNotificationAsRead = async (): Promise<void> => {
    if (!(await markNotificationsAsRead())) {
      logLine('Marking notifications as read is disabled')
      return
    }

    try {
      const elementData = (
        element as unknown as {
          data?: {
            recordClickEndpoint?: {
              recordNotificationInteractionsEndpoint?: {
                serializedInteractionsRequest?: string
              }
            }
          }
        }
      )?.data

      if (!elementData) {
        logError(
          'Missing required data to mark notification as read',
          elementData,
        )
        return
      }

      const payload = {
        serializedRecordNotificationInteractionsRequest:
          elementData.recordClickEndpoint.recordNotificationInteractionsEndpoint
            .serializedInteractionsRequest,
      }

      const response = await _apiPost(
        'notification/record_interactions?prettyPrint=false',
        payload,
      )
      const responseJson = await response.json()

      if (response.ok && responseJson?.success) {
        logLine('Notification marked as read')
      } else {
        logError('Failed to mark notification as read', responseJson)
      }
    } catch (error) {
      logError('Failed to mark notification as read', error)
    }
  }

  const _apiPost = async (path: string, payload: object): Promise<Response> => {
    const authorizationHeader = await getAuthorizationHeader()
    const { authUser, clientVersion, pageId, visitorId } = ytData

    if (!authUser || !clientVersion || !visitorId || !authorizationHeader) {
      throw new Error('Missing required data to make request')
    }

    const url = `https://${getHostname()}/youtubei/v1/${path}`
    const finalPayload = {
      ...payload,
      context: {
        client: {
          clientName: 'WEB',
          clientVersion,
        },
      },
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authorizationHeader,
        'Content-Type': 'application/json',
        'X-Origin': 'https://www.youtube.com',
        'X-Goog-Authuser': authUser,
        // PageId seems to be only available when you've switched to a different user from the original one.
        ...(pageId ? { 'X-Goog-PageId': pageId } : {}),
        'X-Goog-Visitor-Id': visitorId,
        'X-Youtube-Bootstrap-Logged-In': 'true',
        'X-Youtube-Client-Name': '1',
        'X-Youtube-Client-Version': clientVersion,
      },
      body: JSON.stringify(finalPayload),
    })
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

  const handleNavigateStart = () => {
    setEnabled(false)
  }

  const handleNavigateFinish = (event) => {
    const newUrl = event.detail?.response?.url as string | null
    setUrl(newUrl)
    setEnabledFromYtData()
  }

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
    window.addEventListener('ytwl-yt-nav-start', handleNavigateStart)
    window.addEventListener('ytwl-yt-nav-finish', handleNavigateFinish)

    window.dispatchEvent(new CustomEvent('ytwl-yt-req'))
  }

  const cleanup = () => {
    clearIntervals()

    element.removeEventListener('mouseenter', onElementMouseEnter)
    element.removeEventListener('mouseleave', onElementMouseLeave)

    window.removeEventListener('ytwl-yt', setYtwlYt)
    window.removeEventListener('ytwl-yt-nav-start', handleNavigateStart)
    window.removeEventListener('ytwl-yt-nav-finish', handleNavigateFinish)
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
        setStatus(3)
      } else if (videoId && erroredVideoIds.has(videoId)) {
        setStatus(4)
      } else if (videoId && pendingVideoIds.has(videoId)) {
        setStatus(2)
      } else {
        setStatus(1)
      }
    } else {
      setStatus(0)
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

  return (
    <button
      className={buttonClasses}
      disabled={status !== 1}
      onClick={addVideo}
      style={overlayButtonStyle}>
      <Icon status={status} />
    </button>
  )
}

startIntervals()

export default WatchLaterButton
