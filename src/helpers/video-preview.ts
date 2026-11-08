import { useWatchLaterStore } from '~/store'

const PREVIEW_CONTAINER_SELECTOR = '#video-preview-container'
const LOOKUP_INTERVAL_MS = 500

// Feeds the store whether YouTube's hover-preview player is hovered. Runs
// once for the whole page instead of once per button, which stacked a
// duplicate pair of listeners on the container for every mounted button.
export const watchVideoPreview = () => {
  const { setVideoPreviewIsHovered } = useWatchLaterStore.getState()
  const onEnter = () => setVideoPreviewIsHovered(true)
  const onLeave = () => setVideoPreviewIsHovered(false)

  let container: Element | null = null

  // YouTube only creates the container once it first needs a preview, so keep
  // looking until it exists rather than giving up after a few tries.
  const interval = setInterval(() => {
    container = document.querySelector(PREVIEW_CONTAINER_SELECTOR)
    if (!container) return

    clearInterval(interval)
    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
  }, LOOKUP_INTERVAL_MS)

  return () => {
    clearInterval(interval)
    container?.removeEventListener('mouseenter', onEnter)
    container?.removeEventListener('mouseleave', onLeave)
  }
}
