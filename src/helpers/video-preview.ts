import { useWatchLaterStore } from '~/store'

// YouTube's hover-preview player. The wrapper has been renamed before
// (`#video-preview-container` -> `#video-preview`), so match the stable custom
// element as well.
const PREVIEW_SELECTOR =
  'ytd-video-preview, #video-preview, #video-preview-container'

// Feeds the store whether the pointer is over YouTube's hover-preview player.
// The preview sits outside the thumbnail card, so moving onto it ends the
// card's own hover; this flag is what keeps the button alive meanwhile.
//
// Delegated from `document` rather than bound to the preview node: YouTube
// creates it lazily and may replace it, which would silently orphan listeners
// bound to one node. One listener serves the whole page.
export const watchVideoPreview = () => {
  const { setVideoPreviewIsHovered } = useWatchLaterStore.getState()
  let hovered = false

  const onMouseOver = (event: MouseEvent) => {
    const next =
      event.target instanceof Element &&
      event.target.closest(PREVIEW_SELECTOR) !== null

    if (next === hovered) return

    hovered = next
    setVideoPreviewIsHovered(next)
  }

  document.addEventListener('mouseover', onMouseOver, { passive: true })

  return () => {
    document.removeEventListener('mouseover', onMouseOver)
    if (hovered) setVideoPreviewIsHovered(false)
  }
}
