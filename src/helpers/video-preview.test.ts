import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { watchVideoPreview } from '~/helpers/video-preview'
import { useWatchLaterStore } from '~/store'

const addPreviewContainer = () => {
  const container = document.createElement('div')
  container.id = 'video-preview-container'
  document.body.appendChild(container)

  return container
}

beforeEach(() => {
  vi.useFakeTimers()
  useWatchLaterStore.setState({ videoPreviewIsHovered: false })
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('watchVideoPreview', () => {
  it('tracks hover on the preview container', () => {
    const container = addPreviewContainer()
    const stop = watchVideoPreview()
    vi.advanceTimersByTime(500)

    container.dispatchEvent(new MouseEvent('mouseenter'))
    expect(useWatchLaterStore.getState().videoPreviewIsHovered).toBe(true)

    container.dispatchEvent(new MouseEvent('mouseleave'))
    expect(useWatchLaterStore.getState().videoPreviewIsHovered).toBe(false)
    stop()
  })

  it('keeps looking when the container appears late', () => {
    const stop = watchVideoPreview()
    vi.advanceTimersByTime(30_000)

    const container = addPreviewContainer()
    vi.advanceTimersByTime(500)
    container.dispatchEvent(new MouseEvent('mouseenter'))

    expect(useWatchLaterStore.getState().videoPreviewIsHovered).toBe(true)
    stop()
  })

  it('attaches listeners only once however long it runs', () => {
    const container = addPreviewContainer()
    const add = vi.spyOn(container, 'addEventListener')
    const stop = watchVideoPreview()

    vi.advanceTimersByTime(5_000)

    expect(add).toHaveBeenCalledTimes(2)
    stop()
  })

  it('removes listeners when stopped', () => {
    const container = addPreviewContainer()
    const stop = watchVideoPreview()
    vi.advanceTimersByTime(500)

    stop()
    container.dispatchEvent(new MouseEvent('mouseenter'))

    expect(useWatchLaterStore.getState().videoPreviewIsHovered).toBe(false)
  })
})
