import packageJson from '@root/package.json'

import { changelog, type ChangelogVersion } from '~changelog'

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (
    reason === 'update' &&
    changelog.some((c: ChangelogVersion) => c.version === packageJson.version)
  ) {
    chrome.tabs.create({ url: chrome.runtime.getURL('tabs/whats-new.html') })
  }
})
