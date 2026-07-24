import packageJson from '@root/package.json'

import { Storage } from '@plasmohq/storage'

import { changelog, type ChangelogVersion } from '~changelog'
import { ButtonPosition, buttonPositionAllowed } from '~types'

const clampToAllowed = (position: string, allowed: string[]): string => {
  if (allowed.includes(position)) return position

  const isTop =
    position === ButtonPosition.TopLeft || position === ButtonPosition.TopRight

  const sameVerticalHalf = allowed.find((candidate) => {
    const candidateIsTop =
      candidate === ButtonPosition.TopLeft ||
      candidate === ButtonPosition.TopRight

    return candidateIsTop === isTop
  })

  return sameVerticalHalf ?? allowed[0]
}

const migrateButtonPosition = async () => {
  const storage = new Storage()
  const legacyPosition: string | undefined = await storage.get('buttonPosition')

  if (!legacyPosition) return

  await Promise.all(
    Object.entries(buttonPositionAllowed).map(async ([context, allowed]) => {
      const existing = await storage.get(context)

      if (existing) return

      await storage.set(context, clampToAllowed(legacyPosition, allowed))
    }),
  )
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'update') {
    await migrateButtonPosition()
  }

  if (
    reason === 'update' &&
    changelog.some((c: ChangelogVersion) => c.version === packageJson.version)
  ) {
    const storage = new Storage()
    const openWhatsNewOnUpdate = await storage.get<boolean>(
      'openWhatsNewOnUpdate',
    )

    if (openWhatsNewOnUpdate) {
      chrome.tabs.create({ url: chrome.runtime.getURL('tabs/whats-new.html') })
    }
  }
})
