import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { startMounting } from '~/helpers/mounting'

vi.mock('~/components/WatchLaterButton', () => ({
  default: () => null,
}))

const MOUNT_INTERVAL_MS = 142

const addNotification = (videoId: string) => {
  const notification = document.createElement('ytd-notification-renderer')
  const link = document.createElement('a')
  link.href = `https://www.youtube.com/watch?v=${videoId}`
  notification.appendChild(link)
  document.body.appendChild(notification)

  return notification
}

let stopMounting: (() => void) | null = null

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  stopMounting?.()
  stopMounting = null
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('startMounting', () => {
  it('mounts one host per inline anchor, however many ticks pass', async () => {
    const notification = addNotification('abc')
    stopMounting = startMounting()

    await vi.advanceTimersByTimeAsync(MOUNT_INTERVAL_MS * 10)

    expect(notification.querySelectorAll('ytwl-button-host')).toHaveLength(1)
  })

  it('mounts newly added anchors without remounting existing ones', async () => {
    const first = addNotification('abc')
    stopMounting = startMounting()
    await vi.advanceTimersByTimeAsync(MOUNT_INTERVAL_MS * 3)

    const second = addNotification('def')
    await vi.advanceTimersByTimeAsync(MOUNT_INTERVAL_MS * 3)

    expect(first.querySelectorAll('ytwl-button-host')).toHaveLength(1)
    expect(second.querySelectorAll('ytwl-button-host')).toHaveLength(1)
  })

  it('removes the host when its anchor is disconnected', async () => {
    const notification = addNotification('abc')
    stopMounting = startMounting()
    await vi.advanceTimersByTimeAsync(MOUNT_INTERVAL_MS * 2)
    const host = notification.querySelector('ytwl-button-host')

    notification.remove()
    await vi.advanceTimersByTimeAsync(MOUNT_INTERVAL_MS * 2)

    expect(host?.isConnected).toBe(false)
  })
})
