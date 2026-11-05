import packageJson from '@root/package.json'
import { browser } from 'wxt/browser'

import { changelog, type ChangelogVersion } from '~/changelog'
import type { MessageName } from '~/helpers/messaging'
import { readSettings } from '~/helpers/settings'
import { getStored, setStored } from '~/helpers/storage'
import { readVisitorCookies } from '~/helpers/visitor-cookie'
import { ButtonPosition, buttonPositionAllowed } from '~/types'

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
  const legacyPosition = await getStored<string>('buttonPosition')

  if (!legacyPosition) return

  await Promise.all(
    Object.entries(buttonPositionAllowed).map(async ([context, allowed]) => {
      const existing = await getStored<string>(context)

      if (existing) return

      await setStored(context, clampToAllowed(legacyPosition, allowed))
    }),
  )
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'update') {
      await migrateButtonPosition()
    }

    if (
      reason === 'update' &&
      changelog.some((c: ChangelogVersion) => c.version === packageJson.version)
    ) {
      const openWhatsNewOnUpdate = await getStored<boolean>(
        'openWhatsNewOnUpdate',
      )

      if (openWhatsNewOnUpdate ?? true) {
        browser.tabs.create({ url: browser.runtime.getURL('/whats-new.html') })
      }
    }
  })

  browser.runtime.onMessage.addListener(
    (message: { name?: MessageName }, sender) => {
      if (message?.name === 'settings') {
        return readSettings().then((data) => ({ data }))
      }

      if (message?.name === 'visitor-cookie') {
        const cookieStoreId = (sender.tab as { cookieStoreId?: string })
          ?.cookieStoreId

        return readVisitorCookies(cookieStoreId).then(
          (data) => ({ data }),
          (error: Error) => ({ error: error.message }),
        )
      }
    },
  )
})
