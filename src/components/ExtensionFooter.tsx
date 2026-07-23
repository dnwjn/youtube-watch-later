import packageJson from '@root/package.json'
import React, { useMemo } from 'react'

import { openTab } from '~helpers/browser'

import '~css/shared.css'

interface ExtensionFooterProps {
  showWhatsNew?: boolean
}

const ExtensionFooter = ({ showWhatsNew = false }: ExtensionFooterProps) => {
  const version = useMemo(() => {
    if (process.env.NODE_ENV === 'production') {
      return `v${packageJson.version}`
    }

    return 'DEV'
  }, [])

  return (
    <div className="footer">
      <button
        className="button bold small"
        onClick={() => openTab('https://dnwjn.dev')}>
        Crafted with ❤️ + 💻 + 🧠 by <span className="name">dnwjn</span>
      </button>

      <div className="bmac">
        <div>Enjoying this little creation?</div>
        <div className="bold">It's free&mdash;always will be.</div>
        <div>But if you'd like to say thanks...</div>
        <a
          className="bmac-link"
          href="https://coff.ee/dnwjn"
          rel="noopener noreferrer"
          target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me a Coffee"
            style={{ height: 30 }}
          />
        </a>
      </div>

      <div className="credits small">
        Version: <span className="name">{version}</span>
        {showWhatsNew && (
          <>
            {' | '}
            <button
              className="whats-new-link"
              onClick={() =>
                openTab(chrome.runtime.getURL('tabs/whats-new.html'))
              }>
              What's new
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ExtensionFooter
