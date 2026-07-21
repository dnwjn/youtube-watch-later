import { afterEach, describe, expect, it } from 'vitest'

import {
  elementIsAnchor,
  elementIsInEndscreenSuggested,
  elementIsInMobilePlayerSuggested,
  elementIsInModernEndscreenSuggested,
  elementIsInNotification,
  elementIsInPlayerSuggested,
  elementIsInPlaylist,
  elementIsInThumbnail,
  elementIsOnVideoDetailPage,
  elementNeedsButton,
} from '~helpers/matching'

afterEach(() => {
  window.history.pushState(null, '', '/')
})

describe('elementIsAnchor', () => {
  it('returns true for an anchor element', () => {
    expect(elementIsAnchor(document.createElement('a'))).toBe(true)
  })

  it('returns false for a non-anchor element', () => {
    expect(elementIsAnchor(document.createElement('div'))).toBe(false)
  })
})

describe('elementIsInThumbnail', () => {
  it.each([
    'YTD-RICH-ITEM-RENDERER',
    'YTD-GRID-VIDEO-RENDERER',
    'YTD-VIDEO-RENDERER',
  ])('returns true for %s', (tag) => {
    expect(elementIsInThumbnail(document.createElement(tag))).toBe(true)
  })

  it('returns false for an unrelated tag', () => {
    expect(elementIsInThumbnail(document.createElement('div'))).toBe(false)
  })
})

describe('elementIsInPlaylist', () => {
  it('returns true for a playlist video renderer', () => {
    expect(
      elementIsInPlaylist(
        document.createElement('YTD-PLAYLIST-VIDEO-RENDERER'),
      ),
    ).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(elementIsInPlaylist(document.createElement('div'))).toBe(false)
  })
})

describe('elementIsInNotification', () => {
  it('returns true for a notification renderer', () => {
    expect(
      elementIsInNotification(
        document.createElement('YTD-NOTIFICATION-RENDERER'),
      ),
    ).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(elementIsInNotification(document.createElement('div'))).toBe(false)
  })
})

describe('elementIsInEndscreenSuggested', () => {
  it('returns true when element has the videowall-still class', () => {
    const el = document.createElement('div')
    el.classList.add('ytp-videowall-still')
    expect(elementIsInEndscreenSuggested(el)).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(
      elementIsInEndscreenSuggested(document.createElement('div')),
    ).toBe(false)
  })
})

describe('elementIsInModernEndscreenSuggested', () => {
  it('returns true when element has the modern videowall-still class', () => {
    const el = document.createElement('div')
    el.classList.add('ytp-modern-videowall-still')
    expect(elementIsInModernEndscreenSuggested(el)).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(
      elementIsInModernEndscreenSuggested(document.createElement('div')),
    ).toBe(false)
  })
})

describe('elementIsInPlayerSuggested', () => {
  it('returns true for yt-lockup-view-model class', () => {
    const el = document.createElement('div')
    el.classList.add('yt-lockup-view-model')
    expect(elementIsInPlayerSuggested(el)).toBe(true)
  })

  it('returns true for ytLockupViewModelHost class', () => {
    const el = document.createElement('div')
    el.classList.add('ytLockupViewModelHost')
    expect(elementIsInPlayerSuggested(el)).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(elementIsInPlayerSuggested(document.createElement('div'))).toBe(
      false,
    )
  })
})

describe('elementIsInMobilePlayerSuggested', () => {
  it('returns true for media-item-menu class', () => {
    const el = document.createElement('div')
    el.classList.add('media-item-menu')
    expect(elementIsInMobilePlayerSuggested(el)).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(
      elementIsInMobilePlayerSuggested(document.createElement('div')),
    ).toBe(false)
  })
})

describe('elementIsOnVideoDetailPage', () => {
  it('returns true when id matches', () => {
    const el = document.createElement('div')
    el.id = 'top-level-buttons-computed'
    expect(elementIsOnVideoDetailPage(el)).toBe(true)
  })

  it('returns false otherwise', () => {
    expect(elementIsOnVideoDetailPage(document.createElement('div'))).toBe(
      false,
    )
  })
})

describe('elementNeedsButton', () => {
  it('returns true for an anchor with a video url', () => {
    const el = document.createElement('a') as HTMLAnchorElement
    el.href = 'https://www.youtube.com/watch?v=abc123'
    expect(elementNeedsButton(el)).toBeTruthy()
  })

  it('returns false for an anchor without a video url', () => {
    const el = document.createElement('a') as HTMLAnchorElement
    el.href = 'https://www.youtube.com/feed/subscriptions'
    expect(elementNeedsButton(el)).toBeFalsy()
  })

  it('returns true on the video detail page when on a watch path', () => {
    window.history.pushState(null, '', '/watch')
    const el = document.createElement('div')
    el.id = 'top-level-buttons-computed'
    expect(elementNeedsButton(el)).toBeTruthy()
  })

  it('returns false on the video detail page when not on a watch/shorts path', () => {
    window.history.pushState(null, '', '/feed/subscriptions')
    const el = document.createElement('div')
    el.id = 'top-level-buttons-computed'
    expect(elementNeedsButton(el)).toBeFalsy()
  })

  it('returns true for a descendant anchor with a video url', () => {
    const el = document.createElement('div')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)
    expect(elementNeedsButton(el)).toBe(true)
  })

  it('returns false when no descendant anchor has a video url', () => {
    const el = document.createElement('div')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/feed/subscriptions'
    el.appendChild(anchor)
    expect(elementNeedsButton(el)).toBe(false)
  })
})
