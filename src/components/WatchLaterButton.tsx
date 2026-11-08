import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import WatchLaterIcon from '~/components/WatchLaterIcon'
import { addToWatchLater, markNotificationAsRead } from '~/helpers/api'
import { hasPath, hasSearch } from '~/helpers/browser'
import { getVideoId } from '~/helpers/extracting'
import {
  elementIsInEndscreenSuggested,
  elementIsInMobilePlayerSuggested,
  elementIsInModernEndscreenSuggested,
  elementIsInNotification,
  elementIsInPlayerSuggested,
  elementIsInPlaylist,
  elementIsInThumbnail,
  elementIsOnVideoDetailPage,
} from '~/helpers/matching'
import { computeOverlayButtonStyle } from '~/helpers/overlay'
import { getSettings } from '~/helpers/system'
import useOverlayAlignmentGuard from '~/hooks/useOverlayAlignmentGuard'
import type { ButtonAnchor, ButtonConfig, Settings, YTData } from '~/interfaces'
import { useWatchLaterStore } from '~/store'
import {
  ButtonOpacity,
  ButtonPosition,
  ButtonPositionContext,
  ButtonStatus,
  ButtonVisibility,
} from '~/types'

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

export const registerGlobalNavigationHandlers = () => {
  window.addEventListener('ytwl-yt-nav-start', handleGlobalNavigateStart)
  window.addEventListener(
    'ytwl-yt-nav-finish',
    handleGlobalNavigateFinish as EventListener,
  )
}

const WatchLaterButton = ({ anchor }: { anchor: ButtonAnchor }) => {
  const { element } = anchor
  const isOverlay = anchor.type === 'overlay'

  // Scoped selectors: subscribing to the whole store would re-render every
  // mounted button on any change (hover, an add anywhere, navigation).
  const ytData = useWatchLaterStore((state) => state.ytData)
  const url = useWatchLaterStore((state) => state.url)
  const enabled = useWatchLaterStore((state) => state.enabled)
  const setYtData = useWatchLaterStore((state) => state.setYtData)
  const setEnabled = useWatchLaterStore((state) => state.setEnabled)
  const setLatestElementRef = useWatchLaterStore(
    (state) => state.setLatestElementRef,
  )
  const markVideoAsPending = useWatchLaterStore(
    (state) => state.markVideoAsPending,
  )
  const markVideoAsAdded = useWatchLaterStore((state) => state.markVideoAsAdded)
  const markVideoAsErrored = useWatchLaterStore(
    (state) => state.markVideoAsErrored,
  )
  const clearVideoError = useWatchLaterStore((state) => state.clearVideoError)
  const isPreviewHoveredForElement = useWatchLaterStore(
    (state) =>
      state.videoPreviewIsHovered && state.latestElementRef === element,
  )

  const [status, setStatus] = useState<number>(ButtonStatus.Hidden)
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
  const isAdded = useWatchLaterStore(
    (state) => !!videoId && state.addedVideoIds.has(videoId),
  )
  const isErrored = useWatchLaterStore(
    (state) => !!videoId && state.erroredVideoIds.has(videoId),
  )
  const isPending = useWatchLaterStore(
    (state) => !!videoId && state.pendingVideoIds.has(videoId),
  )

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
    if (isPreviewHoveredForElement) return true
    return false
  }, [
    configLoaded,
    status,
    buttonConfig,
    isHovered,
    isPreviewHoveredForElement,
    isOnVideoDetail,
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

  const visible = useMemo(() => {
    const isWL = hasSearch(url, 'list', 'WL')
    const isPlaylists = hasPath(url, '/feed/playlists')
    const isWatchLaterItem =
      (isOnVideoDetail && isWL) || (isInPlaylist && (isWL || isPlaylists))

    return enabled && (isInNotification || !isWatchLaterItem)
  }, [enabled, isInPlaylist, isInNotification, isOnVideoDetail, url])

  useEffect(() => {
    // status is also driven imperatively by addVideo's async flow
    // (Loading/Success/Error), so it can't be a value purely derived at
    // render time; this effect resyncs it with the shared store.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (visible && hasData) {
      if (isAdded) {
        setStatus(ButtonStatus.Success)
      } else if (isErrored) {
        setStatus(ButtonStatus.Error)
      } else if (isPending) {
        setStatus(ButtonStatus.Loading)
      } else {
        setStatus(ButtonStatus.Default)
      }
    } else {
      setStatus(ButtonStatus.Hidden)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [visible, hasData, isAdded, isErrored, isPending])

  // init/cleanup close over per-render state (ytData, url, positionContext, ...)
  // but the mount effect below must only run once, so the latest versions are
  // tracked in refs, kept in sync after every render rather than mutated
  // directly during render.
  const initRef = useRef(init)
  const cleanupRef = useRef(cleanup)
  useEffect(() => {
    initRef.current = init
    cleanupRef.current = cleanup
  })

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
