import type { PlasmoCSConfig } from 'plasmo'

import type { YTData } from '~interfaces'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  world: 'MAIN',
}

const getYtData = async () => {
  const ytcfg = (
    window as unknown as {
      ytcfg?: { get: (key: string) => unknown }
    }
  ).ytcfg

  if (typeof ytcfg !== 'undefined') {
    const authUser = ytcfg.get('SESSION_INDEX') as string | null
    const clientTheme = (
      ytcfg.get('INNERTUBE_CONTEXT') as
        { client?: { userInterfaceTheme?: string } } | undefined
    )?.client?.userInterfaceTheme as string | null
    const clientVersion = ytcfg.get('INNERTUBE_CLIENT_VERSION') as string | null
    const loggedIn = ytcfg.get('LOGGED_IN') === true
    const pageId = ytcfg.get('DELEGATED_SESSION_ID') as string | null
    const visitorId = ytcfg.get('VISITOR_DATA') as string | null

    const ytData: YTData = {
      authUser,
      clientTheme,
      clientVersion,
      loggedIn,
      pageId,
      visitorId,
    }

    window.dispatchEvent(new CustomEvent('ytwl-yt', { detail: ytData }))
  }
}

window.addEventListener('ytwl-yt-req', getYtData)

const handleNavigateStart = () => {
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
