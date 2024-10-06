import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchorList,
  PlasmoGetStyle,
  PlasmoMountShadowHost,
} from 'plasmo'
import React, { useEffect, useMemo, useState } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import { logError, logLine } from '~helpers'
import type { YTData } from '~interfaces'
import { useWatchLaterStore } from '~store'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  all_frames: true,
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = `
        #plasmo-shadow-container {
            z-index: 10 !important;
        }

        #plasmo-shadow-container,
        #plasmo-shadow-container .plasmo-csui-container {
            position: unset !important;
        }

        #plasmo-shadow-container:has(.watch-later-btn.inside-notification.spaced) {
            margin-top: 60px;
        }

        .watch-later-btn {
            position: absolute;
            left: 10px;
            top: 10px;
            background-color: #ff0000;
            color: #fff;
            padding: 5px;
            border: none;
            z-index: 10;
            cursor: pointer;
            font-size: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: background-color .5s cubic-bezier(.05,0,0,1);
        }

        .watch-later-btn.inside-notification {
            left: unset;
            top: unset;
            right: 10px;
            bottom: 10px;
        }

        .watch-later-btn:not(.loading):not(.success):not(.error):hover {
            background-color: #cc0000;
        }

        .watch-later-btn.loading,
        .watch-later-btn.success,
        .watch-later-btn.error {
            cursor: not-allowed;
        }

        .watch-later-btn.loading {
            animation: blink 1s ease-in-out infinite;
        }

        .watch-later-btn.success,
        .watch-later-btn.error {
            opacity: 0.75;
        }

        .watch-later-btn svg {
            pointer-events: none;
            display: inherit;
            width: 100%;
            height: 100%;
        }

        @keyframes blink {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.25;
            }
        }
    `
  return style
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = document.querySelectorAll(
    'ytd-thumbnail, ytd-notification-renderer',
  )

  return (
    Array.from(elements)
      // Filter out elements that already have the button.
      .filter((element) => !element.querySelector('.watch-later-btn'))
      // Filter out elements that are not a video.
      .filter((element) =>
        Array.from(element.querySelectorAll('a')).some((a) =>
          a.href.includes('?v='),
        ),
      )
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
      fill="#fff"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"></path>
    </svg>
  )
}

const WatchLaterButton = ({ anchor }) => {
  const { element } = anchor

  const { ytData, url, enabled, setYtData, setUrl, setEnabled } = useWatchLaterStore()

  /**
   * 0: Hidden
   * 1: Default
   * 2: Loading
   * 3: Success
   * 4: Error
   */
  const [status, setStatus] = useState(0)
  const [visible, setVisible] = useState(false)
  const [hasData, setHasData] = useState(false)

  const isInNotification = element.tagName === 'YTD-NOTIFICATION-RENDERER'

  const buttonClasses = useMemo(() => {
    let classes = ['watch-later-btn']

    if (isInNotification) {
      classes.push('inside-notification')

      if (element.offsetHeight < 100) {
        classes.push('spaced')
      }
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
  }, [status])

  const addVideo = async (event) => {
    event.stopPropagation()

    if (status !== 1) return

    const videoUrl = element.querySelector('a')?.href
    if (videoUrl) {
      const videoId = new URL(videoUrl).searchParams.get('v')

      if (videoId && ytData) {
        setStatus(2)

        addToWatchLater(videoId, ytData)
          .then(() => setStatus(3))
          .catch(() => setStatus(4))
          .finally(() => {
            setTimeout(() => setStatus(1), 2000)
          })
      }
    }
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

  const handleNavigateStart = () => {
    setEnabled(false)
  }

  const handleNavigateFinish = (event) => {
    const newUrl = event.detail?.response?.url as string | null
    setUrl(newUrl)
    setEnabled(true)
  }

  useEffect(() => {
    if (!enabled || (!isInNotification && url?.includes('/playlist?list=WL'))) {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [enabled, isInNotification, url])

  useEffect(() => {
    if (visible && hasData) {
      setStatus(1)
    } else {
      setStatus(0)
    }
  }, [visible, hasData])

  useEffect(() => {
    if (ytData) {
      setHasData(true)
      return
    }

    window.addEventListener('ytwl-yt', setYtwlYt)
    window.addEventListener('ytwl-yt-nav-start', handleNavigateStart)
    window.addEventListener('ytwl-yt-nav-finish', handleNavigateFinish)

    window.dispatchEvent(new CustomEvent('ytwl-yt-req'))

    return () => {
      window.removeEventListener('ytwl-yt', setYtwlYt)
      window.removeEventListener('ytwl-yt-nav-start', handleNavigateStart)
      window.removeEventListener('ytwl-yt-nav-finish', handleNavigateFinish)
    }
  }, [])

  if (status === 0) return null

  return (
    <button
      className={buttonClasses}
      disabled={status !== 1}
      onClick={addVideo}>
      <Icon status={status} />
    </button>
  )
}

export default WatchLaterButton

const sha1 = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const getAuthorizationHeader = async () => {
  let sapisidCookie: string | null

  try {
    sapisidCookie = await sendToBackground<string | null>({
      name: 'visitor-cookie',
    })
  } catch (error) {
    throw new Error('Visitor cookie not found. Reason: ' + error)
  }

  if (!sapisidCookie) {
    throw new Error('Visitor cookie not found. Reason: no value')
  }

  const sapisid = sapisidCookie
  const origin = 'https://www.youtube.com'
  const time = Math.floor(Date.now() / 1000)
  const hash = await sha1(`${time} ${sapisid} ${origin}`)
  const authorizationHeader = `${time}_${hash}`

  return authorizationHeader
}

const addToWatchLater = async (
  videoId: string,
  ytData: YTData,
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const { authUser, clientVersion, pageId, visitorId } = ytData

    try {
      const authorizationHeader = await getAuthorizationHeader()

      if (!authUser || !clientVersion || !visitorId || !authorizationHeader) {
        logError('Missing required data:', {
          authUser,
          clientVersion,
          pageId,
          visitorId,
          authorizationHeader,
        })
        reject()
        return
      }

      const payload = {
        actions: [
          {
            action: 'ACTION_ADD_VIDEO',
            addedVideoId: videoId,
          },
        ],
        context: {
          client: {
            clientName: 'WEB',
            clientVersion,
          },
        },
        playlistId: 'WL',
      }

      const response = await fetch(
        'https://www.youtube.com/youtubei/v1/browse/edit_playlist?prettyPrint=false',
        {
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
          body: JSON.stringify(payload),
        },
      )

      const responseJson = await response.json()

      if (response.ok && responseJson.status === 'STATUS_SUCCEEDED') {
        logLine('Video added to Watch Later:', videoId)
        resolve()
      } else {
        logError('Failed to add video to Watch Later:', responseJson)
        reject()
      }
    } catch (error) {
      error('Failed to add video to Watch Later:', error)
      reject()
    }
  })
}
