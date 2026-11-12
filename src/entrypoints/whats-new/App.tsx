import { i18n } from '#i18n'
import React from 'react'

import { changelog } from '~/changelog'
import ExtensionFooter from '~/components/ExtensionFooter'
import ExtensionHeader from '~/components/ExtensionHeader'

import '~/css/whats-new.css'

// Entry keys are built at runtime from the changelog version, so they can't be
// checked against the generated key union.
type MessageKey = Parameters<typeof i18n.t>[0]

const entryText = (version: string, type: string, n: number) =>
  i18n.t(
    `changelog.v${version.replaceAll('.', '_')}.${type}_${n}` as MessageKey,
  )

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(browser.i18n.getUILanguage(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(iso))

const TYPE_ORDER: Array<'new' | 'improved' | 'fixed'> = [
  'new',
  'improved',
  'fixed',
]

const WhatsNew = () => {
  return (
    <div className="whats-new-root">
      <ExtensionHeader
        title={i18n.t('whatsNew.title')}
        subtitle={i18n.t('whatsNew.subtitle')}
      />

      <div>
        {changelog.map((version) => (
          <div key={version.version} className="whats-new-version">
            <div className="whats-new-version-header">
              <h2 className="whats-new-version-number">v{version.version}</h2>
              <span className="whats-new-version-date">
                {formatDate(version.date)}
              </span>
            </div>

            {TYPE_ORDER.map((type) => {
              const count = version.entries[type] || 0
              if (count === 0) return null

              return (
                <div key={type} className="whats-new-group">
                  <h3 className="whats-new-group-label">
                    {i18n.t(`whatsNew.type.${type}`)}
                  </h3>
                  <ul className="whats-new-list">
                    {Array.from({ length: count }, (_, i) => (
                      <li key={i} className="whats-new-list-item">
                        {entryText(version.version, type, i + 1)}
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
