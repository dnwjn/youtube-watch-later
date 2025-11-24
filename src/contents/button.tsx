import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchorList,
  PlasmoGetStyle,
  PlasmoMountShadowHost,
} from 'plasmo'
import React, { useEffect, useMemo, useState } from 'react'

import { getAuthorizationHeader } from '~helpers/api'
import { hasPath, hasSearch } from '~helpers/browser'
import { logError, logLine } from '~helpers/logging'
import {
  buttonOpacity,
  buttonPosition,
  buttonVisibility,
  markNotificationsAsRead,
} from '~helpers/system'
import useVideoPreviewListener from '~hooks/useVideoPreviewListener'
import type { ButtonConfig, YTData } from '~interfaces'
import { useWatchLaterStore } from '~store'
import { ButtonOpacity, ButtonPosition, ButtonVisibility } from '~types'
import { elementIsAnchor } from '~helpers/dom'
import { buttonStyles } from './button.styles'

let inlineAnchorListInterval: NodeJS.Timeout | null = null

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

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = document.querySelectorAll(
    'ytd-rich-item-renderer, \
    ytd-playlist-video-renderer, \
    ytd-notification-renderer, \
    ytd-search ytd-video-renderer, \
    .ytp-endscreen-content .ytp-videowall-still, \
    .ytp-fullscreen-grid .ytp-modern-videowall-still, \
    ytd-watch-metadata #top-level-buttons-computed'
  )

  return (
    Array.from(elements)
      // Filter out elements that already have the button.
      .filter((element) => !element.querySelector('.watch-later-btn'))
      // Filter out elements that are not a video.
      .filter((element) => {
        if (elementIsAnchor(element)) {
          return (element as HTMLAnchorElement).href.includes('?v=')
        }

        // For video detail page, check if we're on a watch page.
        if (element.id === 'top-level-buttons-computed') {
          return window.location.pathname === '/watch'
        }

        return Array.from(element.querySelectorAll('a')).some((a) =>
          a.href.includes('?v='),
        )
      })
      .map((element) => ({
        element,
        insertPosition: 'beforebegin',
      }))
  )
}

export const mountShadowHost: PlasmoMountShadowHost = ({
  shadowHost,
  anchor,
  mountState,
}) => {
  // Insert the shadow host as the first child of the anchor element.
  anchor.element.insertBefore(shadowHost, anchor.element.firstChild)
  mountState.observer.disconnect()
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
      className="with-fill">
      <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
    </svg>
  )
}

const WatchLaterButton = ({ anchor }) => {
  const { element } = anchor

  useVideoPreviewListener()

  const {
    ytData,
    url,
    enabled,
    latestElementRef,
    videoPreviewIsHovered,
    setYtData,
    setUrl,
    setEnabled,
    setLatestElementRef,
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
  const [isHovered, setIsHovered] = useState(false)

  const isInThumbnail = [
    'YTD-RICH-ITEM-RENDERER',
    'YTD-GRID-VIDEO-RENDERER',
    'YTD-VIDEO-RENDERER',
  ].includes(element.tagName)
  const isInPlaylist = ['YTD-PLAYLIST-VIDEO-RENDERER'].includes(element.tagName)
  const isInNotification = ['YTD-NOTIFICATION-RENDERER'].includes(
    element.tagName,
  )
  const isInEndscreenSuggested = element.classList.contains('ytp-videowall-still')
  const isInModernEndscreenSuggested = element.classList.contains('ytp-modern-videowall-still')
  const isInVideoDetail = element.id === 'top-level-buttons-computed'

  const buttonClasses = useMemo(() => {
    let classes = ['watch-later-btn']

    if (buttonConfig.opacity) {
      classes.push(buttonConfig.opacity)
    }
    if (buttonConfig.position) {
      classes.push(buttonConfig.position)
    }

    if (isInThumbnail) {
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
    if (isInVideoDetail) {
      classes.push('in-video-detail')
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
  }, [status, ytData?.clientTheme, buttonConfig])

  const shouldShow = useMemo(() => {
    if (status === 0) return false
    if (isInVideoDetail) return true // Always show on video detail page
    if (buttonConfig.visibility === ButtonVisibility.Always) return true
    if (isHovered) return true
    if (videoPreviewIsHovered && latestElementRef === element) return true
    return false
  }, [status, buttonConfig, isHovered, videoPreviewIsHovered, latestElementRef, isInVideoDetail])

  const fetchButtonConfig = async () => {
    const opacity = await buttonOpacity()
    const position = await buttonPosition()
    const visibility = await buttonVisibility()

    setButtonConfig({
      opacity: opacity || buttonConfig.opacity,
      position: position || buttonConfig.position,
      visibility: visibility || buttonConfig.visibility,
    })
  }

  const addVideo = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (status !== 1) return

    let videoId: string | null = null

    if (isInVideoDetail) {
      // For video detail page, get video ID from current URL
      videoId = new URLSearchParams(window.location.search).get('v')
    } else {
      // For other pages, get video ID from element
      const videoUrl = elementIsAnchor(element) ? element.href : element.querySelector('a')?.href
      if (videoUrl) {
        videoId = new URL(videoUrl).searchParams.get('v')
      }
    }

    if (videoId && ytData) {
      setStatus(2)

      addToWatchLater(videoId)
        .then(() => {
          setStatus(3)

          if (isInNotification) {
            markNotificationAsRead()
          }
        })
        .catch(() => setStatus(4))
        .finally(() => {
          setTimeout(() => setStatus(1), 2000)
        })
    }
  }

  const addToWatchLater = async (videoId: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const payload = {
          actions: [
            {
              action: 'ACTION_ADD_VIDEO',
              addedVideoId: videoId,
            },
          ],
          playlistId: 'WL',
        }

        const response = await _apiPost(
          'https://www.youtube.com/youtubei/v1/browse/edit_playlist?prettyPrint=false',
          payload,
        )
        const responseJson = await response.json()

        if (response.ok && responseJson.status === 'STATUS_SUCCEEDED') {
          logLine('Video added to Watch Later', videoId)
          resolve()
        } else {
          logError('Failed to add video to Watch Later', responseJson)
          reject()
        }
      } catch (error) {
        logError('Failed to add video to Watch Later', error)
        reject()
      }
    })
  }

  const markNotificationAsRead = async (): Promise<void> => {
    if (!(await markNotificationsAsRead())) {
      logLine('Marking notifications as read is disabled')
      return
    }

    try {
      const elementData: any = element?.data

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
        'https://www.youtube.com/youtubei/v1/notification/record_interactions?prettyPrint=false',
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

  const _apiPost = async (
    url: string,
    payload: object,
  ): Promise<Response | null> => {
    return new Promise(async (resolve, reject) => {
      const authorizationHeader = await getAuthorizationHeader()
      const { authUser, clientVersion, pageId, visitorId } = ytData

      if (!authUser || !clientVersion || !visitorId || !authorizationHeader) {
        reject('Missing required data to make request')
        return
      }

      const finalPayload = {
        ...payload,
        context: {
          client: {
            clientName: 'WEB',
            clientVersion,
          },
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `SAPISIDHASH ${authorizationHeader}`,
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

      resolve(response)
    })
  }

  const onElementMouseEnter = () => {
    setIsHovered(true)
    setLatestElementRef(element)
  }

  const onElementMouseLeave = () => setIsHovered(false)

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

  const setEnabledFromYtData = () => {
    if (ytData) {
      setEnabled(ytData?.loggedIn === true)
    }
  }

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
    setEnabled(false)
    clearIntervals()

    element.removeEventListener('mouseenter', onElementMouseEnter)
    element.removeEventListener('mouseleave', onElementMouseLeave)

    window.removeEventListener('ytwl-yt', setYtwlYt)
    window.removeEventListener('ytwl-yt-nav-start', handleNavigateStart)
    window.removeEventListener('ytwl-yt-nav-finish', handleNavigateFinish)
  }

  useEffect(() => {
    setEnabledFromYtData()
  }, [ytData]);

  useEffect(() => {
    const isWL = hasSearch(url, 'list', 'WL')
    const isPlaylists = hasPath(url, '/feed/playlists')

    if (!enabled || (!isInNotification && !isInVideoDetail && (isWL || isPlaylists))) {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [enabled, isInNotification, isInVideoDetail, url])

  useEffect(() => {
    if (visible && hasData) {
      setStatus(1)
    } else {
      setStatus(0)
    }
  }, [visible, hasData])

  useEffect(() => {
    const handlePopState = () => {
      cleanup()
      setTimeout(() => init(), 100)
    }

    init()
    window.addEventListener('popstate', handlePopState)

    return () => {
      cleanup()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!shouldShow) return null

  return (
    <button
      className={buttonClasses}
      disabled={status !== 1}
      onClick={addVideo}>
      <Icon status={status} />
    </button>
  )
}

startIntervals()

export default WatchLaterButton
