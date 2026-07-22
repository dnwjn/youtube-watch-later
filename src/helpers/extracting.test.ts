import { afterEach, describe, expect, it } from 'vitest'

import { getMobileSuggestedMenuHref, getVideoId } from '~helpers/extracting'

afterEach(() => {
  window.history.pushState(null, '', '/')
  document.body.innerHTML = ''
})

describe('getMobileSuggestedMenuHref', () => {
  it('finds the anchor href within the closest ytm-media-item ancestor', () => {
    document.body.innerHTML = `
      <ytm-media-item>
        <div class="media-item-menu"><a href="https://www.youtube.com/watch?v=abc123">video</a></div>
      </ytm-media-item>
    `
    const el = document.querySelector('.media-item-menu') as Element
    expect(getMobileSuggestedMenuHref(el)).toBe(
      'https://www.youtube.com/watch?v=abc123',
    )
  })

  it('returns an empty string when there is no ytm-media-item ancestor', () => {
    const el = document.createElement('div')
    expect(getMobileSuggestedMenuHref(el)).toBe('')
  })
})

describe('getVideoId', () => {
  it('extracts the id from the current url on the video detail page', () => {
    window.history.pushState(null, '', '/watch?v=abc123')
    const el = document.createElement('div')
    el.id = 'top-level-buttons-computed'
    expect(getVideoId(el)).toBe('abc123')
  })

  it('extracts the id from a mobile player suggested element', () => {
    document.body.innerHTML = `
      <ytm-media-item>
        <div class="media-item-menu"><a href="https://www.youtube.com/watch?v=abc123">video</a></div>
      </ytm-media-item>
    `
    const el = document.querySelector('.media-item-menu') as Element
    expect(getVideoId(el)).toBe('abc123')
  })

  it('extracts the id from an anchor element', () => {
    const el = document.createElement('a') as HTMLAnchorElement
    el.href = 'https://www.youtube.com/watch?v=abc123'
    expect(getVideoId(el)).toBe('abc123')
  })

  it('extracts the id from a descendant anchor', () => {
    const el = document.createElement('div')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)
    expect(getVideoId(el)).toBe('abc123')
  })

  it('returns null when there is no matching anchor', () => {
    const el = document.createElement('div')
    expect(getVideoId(el)).toBeNull()
  })
})
