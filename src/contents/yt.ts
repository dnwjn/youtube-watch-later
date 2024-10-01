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
    const clientVersion = ytcfg.get('INNERTUBE_CLIENT_VERSION')
    const pageId = ytcfg.get('DELEGATED_SESSION_ID')
    const visitorId = ytcfg.get('VISITOR_DATA')

    const ytData: YTData = {
      authUser,
      clientVersion,
      pageId,
      visitorId,
    }

    window.dispatchEvent(new CustomEvent('ytwl-yt', { detail: ytData }))
  }
}

window.addEventListener('ytwl-yt-req', getYtData)

// window.addEventListener('yt-navigate-finish', () => {
//     setTimeout(async () => {
//         await main();
//     }, 1000);
// });

// window.addEventListener('hashchange', () => {
//     setTimeout(async () => {
//         await main();
//     }, 1000);
// });
