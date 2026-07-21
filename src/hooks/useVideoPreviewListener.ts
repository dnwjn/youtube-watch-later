import { useEffect } from 'react'

import { useWatchLaterStore } from '~store'

const useVideoPreviewListener = () => {
  const setVideoPreviewIsHovered = useWatchLaterStore(
    (state) => state.setVideoPreviewIsHovered,
  )

  useEffect(() => {
    let tries = 0

    const videoPreviewInterval = setInterval(() => {
      const videoPreviewEl = document.querySelector('#video-preview-container')

      if (videoPreviewEl) {
        clearInterval(videoPreviewInterval)
        videoPreviewEl.addEventListener('mouseenter', () =>
          setVideoPreviewIsHovered(true),
        )
        videoPreviewEl.addEventListener('mouseleave', () =>
          setVideoPreviewIsHovered(false),
        )
      } else if (tries < 10) {
        tries += 1
      } else {
        clearInterval(videoPreviewInterval)
      }
    }, 500)

    return () => clearInterval(videoPreviewInterval)
  }, [setVideoPreviewIsHovered])
}

export default useVideoPreviewListener
