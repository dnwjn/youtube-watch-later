import { describe, expect, it } from 'vitest'

import {
  extractVideoId,
  hasPath,
  hasSearch,
  isVideoUrl,
} from '~helpers/browser'

describe('hasSearch', () => {
  it('returns false when url is null', () => {
    expect(hasSearch(null, 'foo', 'bar')).toBe(false)
  })

  it('returns false when url has no search params', () => {
    expect(hasSearch('https://example.com/path', 'foo', 'bar')).toBe(false)
  })

  it('returns true when search param matches value', () => {
    expect(hasSearch('https://example.com?foo=bar', 'foo', 'bar')).toBe(true)
  })

  it('returns false when search param does not match value', () => {
    expect(hasSearch('https://example.com?foo=baz', 'foo', 'bar')).toBe(false)
  })
})

describe('hasPath', () => {
  it('returns false when url is null', () => {
    expect(hasPath(null, '/watch')).toBe(false)
  })

  it('returns true when pathname matches', () => {
    expect(hasPath('https://example.com/watch', '/watch')).toBe(true)
  })

  it('returns false when pathname does not match', () => {
    expect(hasPath('https://example.com/shorts', '/watch')).toBe(false)
  })

  it('falls back to string comparison when url is not a valid URL', () => {
    expect(hasPath('/watch', '/watch')).toBe(true)
  })
})

describe('isVideoUrl', () => {
  it('returns false for empty string', () => {
    expect(isVideoUrl('')).toBe(false)
  })

  it('returns true for a ?v= query param', () => {
    expect(isVideoUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
  })

  it('returns true for a /shorts/ path', () => {
    expect(isVideoUrl('https://www.youtube.com/shorts/abc123')).toBe(true)
  })

  it('returns false for a non-video url', () => {
    expect(isVideoUrl('https://www.youtube.com/feed/subscriptions')).toBe(false)
  })

  it('falls back to string matching for malformed urls', () => {
    expect(isVideoUrl('not a real url but has ?v=abc123')).toBe(true)
  })
})

describe('extractVideoId', () => {
  it('returns null when url is null', () => {
    expect(extractVideoId(null)).toBeNull()
  })

  it('extracts id from ?v= query param', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=abc123')).toBe(
      'abc123',
    )
  })

  it('extracts id from /shorts/ path', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/abc123')).toBe(
      'abc123',
    )
  })

  it('extracts id from /shorts/ path with trailing segments', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/abc123/extra')).toBe(
      'abc123',
    )
  })

  it('returns null when neither format matches', () => {
    expect(
      extractVideoId('https://www.youtube.com/feed/subscriptions'),
    ).toBeNull()
  })

  it('falls back to string matching for malformed urls', () => {
    expect(extractVideoId('not a real url but has ?v=abc123')).toBe('abc123')
  })
})
