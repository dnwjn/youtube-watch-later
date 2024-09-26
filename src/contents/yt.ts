import type { PlasmoCSConfig } from 'plasmo'

import type { YTData } from '~interfaces'

export const config: PlasmoCSConfig = {
  matches: ['*://*.youtube.com/*'],
  world: 'MAIN',
}

const getYtData = async () => {
  if (typeof window.ytcfg !== 'undefined') {
    const authUser = window.ytcfg.get('SESSION_INDEX')
    const clientVersion = window.ytcfg.get('INNERTUBE_CLIENT_VERSION')

    const ytData: YTData = {
      authUser,
      clientVersion,
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
