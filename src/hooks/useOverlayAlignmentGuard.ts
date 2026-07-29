import { useEffect, type RefObject } from 'react'

// An overlay button's Plasmo container tracks the anchor through React
// state, which starts at (0, 0) and lags behind whenever YouTube swaps
// content: a freshly mounted button paints before its container is
// positioned, and an existing button's anchor can collapse to a zero rect
// (while staying connected) which snaps the container back to the scroll
// origin - both pile every affected button up at the same spot. React
// state can't close those windows (its updates are what lag), so this
// guard runs every frame and toggles visibility with a direct DOM write:
// the button renders `visibility: hidden` (the render owns that initial
// value and never changes it) and is only shown while its container is
// measurably aligned with a valid anchor rect.
const useOverlayAlignmentGuard = (
  isOverlay: boolean,
  element: Element,
  buttonRef: RefObject<HTMLButtonElement>,
) => {
  useEffect(() => {
    if (!isOverlay) return

    let rafId = 0
    let misalignedFrames = 0

    const check = () => {
      rafId = requestAnimationFrame(check)

      const button = buttonRef.current
      if (!button) return

      const container = button.parentElement
      const anchorRect = element.getBoundingClientRect()

      const anchorValid =
        element.isConnected && anchorRect.width > 0 && anchorRect.height > 0

      let aligned = false
      if (container && anchorValid) {
        const containerRect = container.getBoundingClientRect()
        aligned =
          Math.abs(containerRect.left - anchorRect.left) < 1 &&
          Math.abs(containerRect.top - anchorRect.top) < 1
      }

      // Safety valve: alignment assumes Plasmo's positioned container is the
      // button's parent element. If a Plasmo upgrade ever breaks that, the
      // guard would keep every button hidden forever - so after ~1s of a
      // valid anchor that never aligns, show the button anyway. Normal
      // operation aligns within a few frames and never gets near this.
      if (aligned || !anchorValid) {
        misalignedFrames = 0
      } else {
        misalignedFrames += 1
      }

      const visibility = aligned || misalignedFrames > 60 ? 'visible' : 'hidden'
      if (button.style.visibility !== visibility) {
        button.style.visibility = visibility
      }
    }

    rafId = requestAnimationFrame(check)

    return () => cancelAnimationFrame(rafId)
  }, [isOverlay, element, buttonRef])
}

export default useOverlayAlignmentGuard
