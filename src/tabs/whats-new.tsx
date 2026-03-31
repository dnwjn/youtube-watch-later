import packageJson from '@root/package.json'
import logo from 'data-base64:@root/assets/icon.png'
import React from 'react'

import { changelog } from '~changelog'
import { openTab } from '~helpers/browser'

import '~css/whats-new.css'

const TYPE_LABELS: Record<string, string> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
}

const TYPE_ORDER: Array<'new' | 'improved' | 'fixed'> = [
  'new',
  'improved',
  'fixed',
]

const WhatsNew = () => {
  return (
    <div className="whats-new-root">
      <div className="whats-new-header">
        <img className="whats-new-logo" src={logo} alt="logo" />
        <h1 className="whats-new-title">What's New in YouTube Watch Later</h1>
      </div>

      <div>
        {changelog.map((version) => (
          <div key={version.version} className="whats-new-version">
            <div className="whats-new-version-header">
              <h2 className="whats-new-version-number">v{version.version}</h2>
              <span className="whats-new-version-date">{version.date}</span>
            </div>

            {TYPE_ORDER.map((type) => {
              const entries = version.entries[type] || []
              if (entries.length === 0) return null

              return (
                <div key={type} className="whats-new-group">
                  <h3 className="whats-new-group-label">{TYPE_LABELS[type]}</h3>
                  <ul className="whats-new-list">
                    {entries.map((entry, index) => (
                      <li
                        key={`${type}-${index}`}
                        className="whats-new-list-item"
                      >
                        {entry}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="whats-new-footer">
        <button
          className="button bold"
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

        <div className="credits">
          Version: <span className="name">v{packageJson.version}</span>
        </div>
      </div>
    </div>
  )
}

export default WhatsNew
