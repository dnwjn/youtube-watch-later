import React, { useEffect } from 'react'

import { changelog } from '~/changelog'
import ExtensionFooter from '~/components/ExtensionFooter'
import ExtensionHeader from '~/components/ExtensionHeader'
import type { MessageKey } from '~/helpers/i18n'
import useI18n from '~/hooks/useI18n'

import '~/css/whats-new.css'

// Entry keys are built at runtime from the changelog version, so they can't be
// checked against the generated key union.
const entryText = (
  t: (key: MessageKey) => string,
  version: string,
  type: string,
  n: number,
) => t(`changelog.v${version.replaceAll('.', '_')}.${type}_${n}` as MessageKey)

const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(iso))

const TYPE_ORDER: Array<'new' | 'improved' | 'fixed'> = [
  'new',
  'improved',
  'fixed',
]

const WhatsNew = () => {
  const { t, locale } = useI18n()

  useEffect(() => {
    document.title = t('whatsNew.title')
  }, [t])

  return (
    <div className="whats-new-root">
      <ExtensionHeader
        title={t('whatsNew.title')}
        subtitle={t('whatsNew.subtitle')}
      />

      <div>
        {changelog.map((version) => (
          <div key={version.version} className="whats-new-version">
            <div className="whats-new-version-header">
              <h2 className="whats-new-version-number">v{version.version}</h2>
              <span className="whats-new-version-date">
                {formatDate(version.date, locale)}
              </span>
            </div>

            {TYPE_ORDER.map((type) => {
              const count = version.entries[type] || 0
              if (count === 0) return null

              return (
                <div key={type} className="whats-new-group">
                  <h3 className="whats-new-group-label">
                    {t(`whatsNew.type.${type}`)}
                  </h3>
                  <ul className="whats-new-list">
                    {Array.from({ length: count }, (_, i) => (
                      <li key={i} className="whats-new-list-item">
                        {entryText(t, version.version, type, i + 1)}
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
