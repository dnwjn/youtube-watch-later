import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { watchVideoPreview } from '~/helpers/video-preview'
import { useWatchLaterStore } from '~/store'

const addPreview = (selector: 'ytd-video-preview' | '#video-preview') => {
  const preview = document.createElement(
    selector === 'ytd-video-preview' ? 'ytd-video-preview' : 'div',
  )
  if (selector === '#video-preview') preview.id = 'video-preview'

  const inner = document.createElement('video')
  preview.appendChild(inner)
  document.body.appendChild(preview)

  return { preview, inner }
}

const addOutside = () => {
  const outside = document.createElement('div')
  document.body.appendChild(outside)

  return outside
}

const hoverOver = (element: Element) =>
  element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

const isHovered = () => useWatchLaterStore.getState().videoPreviewIsHovered

beforeEach(() => {
  useWatchLaterStore.setState({ videoPreviewIsHovered: false })
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('watchVideoPreview', () => {
  it.each(['ytd-video-preview', '#video-preview'] as const)(
    'tracks the pointer entering and leaving %s',
    (selector) => {
      const { inner } = addPreview(selector)
      const outside = addOutside()
      const stop = watchVideoPreview()

      hoverOver(inner)
      expect(isHovered()).toBe(true)

      hoverOver(outside)
      expect(isHovered()).toBe(false)
      stop()
    },
  )

  it('works for a preview created after watching started', () => {
    const stop = watchVideoPreview()
    const { inner } = addPreview('ytd-video-preview')

    hoverOver(inner)

    expect(isHovered()).toBe(true)
    stop()
  })

  it('works after YouTube replaces the preview element', () => {
    const stop = watchVideoPreview()
    const first = addPreview('ytd-video-preview')
    first.preview.remove()
    const second = addPreview('ytd-video-preview')

    hoverOver(second.inner)

    expect(isHovered()).toBe(true)
    stop()
  })

  it('stops tracking once stopped', () => {
    const { inner } = addPreview('ytd-video-preview')
    const stop = watchVideoPreview()

    stop()
    hoverOver(inner)

    expect(isHovered()).toBe(false)
  })
})
