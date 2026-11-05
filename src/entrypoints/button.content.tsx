import { registerGlobalNavigationHandlers } from '~/components/WatchLaterButton'
import { startMounting } from '~/helpers/mounting'

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  allFrames: true,
  world: 'MAIN',
  main() {
    registerGlobalNavigationHandlers()
    startMounting()
  },
})
