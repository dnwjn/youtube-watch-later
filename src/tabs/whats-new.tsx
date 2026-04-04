import React from 'react'

import { changelog } from '~changelog'
import ExtensionFooter from '~components/ExtensionFooter'
import ExtensionHeader from '~components/ExtensionHeader'

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
      <ExtensionHeader
        title="What's New in YouTube Watch Later"
        subtitle="The noteworthy changes are listed below."
      />

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
                    {entries.map((entry) => (
                      <li key={entry} className="whats-new-list-item">
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

      <ExtensionFooter />
    </div>
  )
}

export default WhatsNew
