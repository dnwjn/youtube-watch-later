import type { PlasmoCSConfig } from 'plasmo'

import { logError, logLine } from '~helpers'
import type { MarkNotifReadEventDetail, YTData } from '~interfaces'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  world: 'MAIN',
}

const getYtData = async () => {
  const ytcfg = (window as any).ytcfg

  if (typeof ytcfg !== 'undefined') {
    const authUser = ytcfg.get('SESSION_INDEX')
    const clientTheme =
      ytcfg.get('INNERTUBE_CONTEXT')?.client?.userInterfaceTheme
    const clientVersion = ytcfg.get('INNERTUBE_CLIENT_VERSION')
    const pageId = ytcfg.get('DELEGATED_SESSION_ID')
    const visitorId = ytcfg.get('VISITOR_DATA')

    const ytData: YTData = {
      authUser,
      clientTheme,
      clientVersion,
      pageId,
      visitorId,
    }

    window.dispatchEvent(new CustomEvent('ytwl-yt', { detail: ytData }))
  }
}

window.addEventListener('ytwl-yt-req', getYtData)

const handleNavigateStart = (event) => {
  window.dispatchEvent(new CustomEvent('ytwl-yt-nav-start'))
}

window.addEventListener('yt-navigate-start', handleNavigateStart)

let navigateFinishTimeout: NodeJS.Timeout = null

const handleNavigateFinish = (event) => {
  clearTimeout(navigateFinishTimeout)

  navigateFinishTimeout = setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('ytwl-yt-nav-finish', { detail: event.detail }),
    )
  }, 100)
}

window.addEventListener('yt-navigate-finish', handleNavigateFinish)

const markNotificationAsRead = async (event: CustomEvent) => {
  const { xpath, authorizationHeader, ytData, loggingEnabled } =
    event.detail as MarkNotifReadEventDetail
  const { authUser, clientVersion, pageId, visitorId } = ytData

  const element: any = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue
  const elementData: any = element?.data

  try {
    if (
      !authUser ||
      !clientVersion ||
      !visitorId ||
      !authorizationHeader ||
      !elementData
    ) {
      logLine(
        'Missing required data',
        [
          authUser,
          clientVersion,
          pageId,
          visitorId,
          authorizationHeader,
          elementData,
        ],
        loggingEnabled,
      )
      return
    }

    const payload = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion,
        },
      },
      serializedRecordNotificationInteractionsRequest:
        elementData.recordClickEndpoint.recordNotificationInteractionsEndpoint
          .serializedInteractionsRequest,
    }

    const response = await fetch(
      'https://www.youtube.com/youtubei/v1/notification/record_interactions?prettyPrint=false',
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

    if (response.ok && responseJson?.success) {
      logLine('Notification marked as read!')
    } else {
      logError('Failed to mark notification as read', [responseJson])
    }
  } catch (error) {
    logError('Failed to mark notification as read', [error])
  }
}

window.addEventListener('ytwl-mark-notif-read', markNotificationAsRead)
