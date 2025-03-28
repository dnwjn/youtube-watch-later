import { useEffect, useState } from 'react'

import { useWatchLaterStore } from '~store'

const useVideoPreviewListener = () => {
  const [tries, setTries] = useState<number>(1)
  const setVideoPreviewIsHovered = useWatchLaterStore(
    (state) => state.setVideoPreviewIsHovered,
  )

  useEffect(() => {
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
        setTries(tries + 1)
      } else {
        clearInterval(videoPreviewInterval)
      }
    }, 500)

    return () => clearInterval(videoPreviewInterval)
  }, [])
}

export default useVideoPreviewListener
