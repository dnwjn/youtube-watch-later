import { afterEach, describe, expect, it } from 'vitest'

import {
  elementIsVisible,
  getOverlayAnchorElementId,
  getOverlayAnchorElements,
  getOverlayAnchorSignature,
  mutationsAffectOverlayAnchors,
  previewOverlayAnchorSelector,
  removeNestedOverlayAnchors,
} from '~helpers/overlay'

const setRect = (element: Element, rect: Partial<DOMRect>) => {
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => '',
      ...rect,
    }) as DOMRect
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('previewOverlayAnchorSelector', () => {
  it('matches a rich item renderer', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    expect(el.matches(previewOverlayAnchorSelector)).toBe(true)
  })

  it('does not match an unrelated element', () => {
    const el = document.createElement('div')
    expect(el.matches(previewOverlayAnchorSelector)).toBe(false)
  })
})

describe('removeNestedOverlayAnchors', () => {
  it('drops a candidate nested inside another candidate', () => {
    const outer = document.createElement('ytd-rich-item-renderer')
    const inner = document.createElement('ytd-playlist-video-renderer')
    outer.appendChild(inner)

    expect(removeNestedOverlayAnchors([outer, inner])).toEqual([outer])
  })

  it('keeps candidates that are not nested in each other', () => {
    const a = document.createElement('ytd-rich-item-renderer')
    const b = document.createElement('ytd-rich-item-renderer')

    expect(removeNestedOverlayAnchors([a, b])).toEqual([a, b])
  })
})

describe('elementIsVisible', () => {
  it('returns false for a display: none element', () => {
    const el = document.createElement('div')
    el.style.display = 'none'
    document.body.appendChild(el)
    setRect(el, { width: 100, height: 100 })

    expect(elementIsVisible(el)).toBe(false)
  })

  it('returns false for a zero-size element', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    setRect(el, { width: 0, height: 0 })

    expect(elementIsVisible(el)).toBe(false)
  })

  it('returns false when scrolled entirely off-screen', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    setRect(el, { x: -500, y: 0, width: 100, height: 100 })

    expect(elementIsVisible(el)).toBe(false)
  })

  it('returns true for a normal visible element', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    setRect(el, { x: 0, y: 0, width: 100, height: 100 })

    expect(elementIsVisible(el)).toBe(true)
  })
})

describe('getOverlayAnchorElements', () => {
  it('excludes candidates that already have a button', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)
    const button = document.createElement('button')
    button.className = 'watch-later-btn'
    el.appendChild(button)
    document.body.appendChild(el)
    setRect(el, { width: 100, height: 100 })

    expect(getOverlayAnchorElements()).toEqual([])
  })

  it('excludes candidates without a video link', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    document.body.appendChild(el)
    setRect(el, { width: 100, height: 100 })

    expect(getOverlayAnchorElements()).toEqual([])
  })

  it('includes a visible candidate with a video link', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)
    document.body.appendChild(el)
    setRect(el, { width: 100, height: 100 })

    expect(getOverlayAnchorElements()).toEqual([el])
  })
})

describe('getOverlayAnchorElementId', () => {
  it('returns a stable id for the same element', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    const first = getOverlayAnchorElementId(el)
    const second = getOverlayAnchorElementId(el)

    expect(first).toBe(second)
  })

  it('returns different ids for different elements', () => {
    const a = document.createElement('ytd-rich-item-renderer')
    const b = document.createElement('ytd-rich-item-renderer')

    expect(getOverlayAnchorElementId(a)).not.toBe(getOverlayAnchorElementId(b))
  })
})

describe('getOverlayAnchorSignature', () => {
  it('changes when the video id behind an anchor changes', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)

    const before = getOverlayAnchorSignature([el])
    anchor.href = 'https://www.youtube.com/watch?v=def456'
    const after = getOverlayAnchorSignature([el])

    expect(before).not.toBe(after)
  })

  it('is stable for the same set of elements', () => {
    const el = document.createElement('ytd-rich-item-renderer')
    const anchor = document.createElement('a')
    anchor.href = 'https://www.youtube.com/watch?v=abc123'
    el.appendChild(anchor)

    expect(getOverlayAnchorSignature([el])).toBe(
      getOverlayAnchorSignature([el]),
    )
  })
})

describe('mutationsAffectOverlayAnchors', () => {
  const makeMutation = (overrides: Partial<MutationRecord>): MutationRecord =>
    ({
      addedNodes: document.createDocumentFragment().childNodes,
      removedNodes: document.createDocumentFragment().childNodes,
      type: 'childList',
      target: document.createElement('div'),
      attributeName: null,
      attributeNamespace: null,
      nextSibling: null,
      previousSibling: null,
      oldValue: null,
      ...overrides,
    }) as MutationRecord

  it('returns false when no added/removed node is an overlay anchor candidate', () => {
    const fragment = document.createDocumentFragment()
    fragment.appendChild(document.createElement('span'))

    const mutation = makeMutation({ addedNodes: fragment.childNodes })

    expect(mutationsAffectOverlayAnchors([mutation])).toBe(false)
  })

  it('returns true when an added node is itself an overlay anchor candidate', () => {
    const fragment = document.createDocumentFragment()
    fragment.appendChild(document.createElement('ytd-rich-item-renderer'))

    const mutation = makeMutation({ addedNodes: fragment.childNodes })

    expect(mutationsAffectOverlayAnchors([mutation])).toBe(true)
  })

  it('returns true when an added node contains an overlay anchor candidate', () => {
    const wrapper = document.createElement('div')
    wrapper.appendChild(document.createElement('ytd-playlist-video-renderer'))
    const fragment = document.createDocumentFragment()
    fragment.appendChild(wrapper)

    const mutation = makeMutation({ addedNodes: fragment.childNodes })

    expect(mutationsAffectOverlayAnchors([mutation])).toBe(true)
  })

  it('returns true when a removed node is an overlay anchor candidate', () => {
    const fragment = document.createDocumentFragment()
    fragment.appendChild(document.createElement('ytd-rich-item-renderer'))

    const mutation = makeMutation({ removedNodes: fragment.childNodes })

    expect(mutationsAffectOverlayAnchors([mutation])).toBe(true)
  })
})
