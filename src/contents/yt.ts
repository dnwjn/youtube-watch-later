import type { PlasmoCSConfig } from 'plasmo'

import type { YTData } from '~interfaces'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  world: 'MAIN',
}

const getYtData = async () => {
  const ytcfg = (window as any).ytcfg

  if (typeof ytcfg !== 'undefined') {
    const authUser = ytcfg.get('SESSION_INDEX')
    const clientTheme = ytcfg.get('INNERTUBE_CONTEXT')?.client?.userInterfaceTheme
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
