import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import { logError, logLine } from '~helpers/logging'
import { markNotificationsAsRead as shouldMarkNotificationsAsRead } from '~helpers/system'
import type { VisitorCookies, YTData } from '~interfaces'

const sha1 = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const getAuthorizationHeader = async () => {
  let cookies: VisitorCookies

  try {
    cookies = await sendToBackgroundViaRelay<VisitorCookies>({
      name: 'visitor-cookie',
    })
  } catch (error) {
    throw new Error('Visitor cookie not found. Reason: ' + error, {
      cause: error,
    })
  }

  if (!cookies?.sapisid && !cookies?.sapisid1p && !cookies?.sapisid3p) {
    throw new Error('Visitor cookie not found. Reason: no value')
  }

  const origin = 'https://www.youtube.com'
  const time = Math.floor(Date.now() / 1000)

  const computeHash = async (cookieValue: string) =>
    `${time}_${await sha1(`${time} ${cookieValue} ${origin}`)}`

  const parts: string[] = []

  if (cookies.sapisid) {
    parts.push(`SAPISIDHASH ${await computeHash(cookies.sapisid)}`)
  }
  if (cookies.sapisid1p) {
    parts.push(`SAPISID1PHASH ${await computeHash(cookies.sapisid1p)}`)
  }
  if (cookies.sapisid3p) {
    parts.push(`SAPISID3PHASH ${await computeHash(cookies.sapisid3p)}`)
  }

  return parts.join(' ')
}

export const getHostname = () => {
  const hostname = window.location.hostname
  return hostname.includes('youtube.com') ? hostname : 'www.youtube.com'
}

const apiPost = async (
  ytData: YTData,
  path: string,
  payload: object,
): Promise<Response> => {
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

export const addToWatchLater = async (
  ytData: YTData,
  videoId: string,
): Promise<void> => {
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
    const response = await apiPost(
      ytData,
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

export const markNotificationAsRead = async (
  ytData: YTData,
  element: Element,
): Promise<void> => {
  if (!(await shouldMarkNotificationsAsRead())) {
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

    const response = await apiPost(
      ytData,
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
