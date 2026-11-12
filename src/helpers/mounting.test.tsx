import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createOverlayManager, startMounting } from '~/helpers/mounting'

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

describe('createOverlayManager', () => {
  const addCard = () => {
    const card = document.createElement('ytd-rich-item-renderer')
    document.body.appendChild(card)

    return card
  }

  const getContainers = () =>
    Array.from(
      document
        .querySelector('ytwl-button-host.ytwl-overlay-root')
        ?.shadowRoot?.querySelectorAll('.ytwl-csui-container') ?? [],
    )

  it('mounts a container per anchor in a single host', () => {
    const manager = createOverlayManager()

    manager.reconcile([addCard(), addCard()])

    expect(document.querySelectorAll('ytwl-button-host')).toHaveLength(1)
    expect(getContainers()).toHaveLength(2)
    manager.teardown()
  })

  it('keeps existing containers when anchors are added or removed', () => {
    const manager = createOverlayManager()
    const [a, b, c] = [addCard(), addCard(), addCard()]

    manager.reconcile([a, b])
    const [containerA, containerB] = getContainers()

    manager.reconcile([a, b, c])
    expect(getContainers().slice(0, 2)).toEqual([containerA, containerB])
    expect(getContainers()).toHaveLength(3)

    manager.reconcile([b, c])
    expect(getContainers()).toHaveLength(2)
    expect(getContainers()).toContain(containerB)
    expect(getContainers()).not.toContain(containerA)
    manager.teardown()
  })

  it('removes the host on teardown', () => {
    const manager = createOverlayManager()
    manager.reconcile([addCard()])

    manager.teardown()

    expect(document.querySelectorAll('ytwl-button-host')).toHaveLength(0)
  })
})
