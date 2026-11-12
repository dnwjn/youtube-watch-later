import packageJson from '@root/package.json'
import { i18n } from '#i18n'
import React, { useMemo } from 'react'

import { openTab } from '~/helpers/browser'

import '~/css/shared.css'

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
        {i18n.t('footer.craftedBy')} <span className="name">dnwjn</span>
      </button>

      <div className="bmac">
        <div>{i18n.t('footer.enjoying')}</div>
        <div className="bold">{i18n.t('footer.free')}</div>
        <div>{i18n.t('footer.thanks')}</div>
        <a
          className="bmac-link"
          href="https://coff.ee/dnwjn"
          rel="noopener noreferrer"
          target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt={i18n.t('footer.bmacAlt')}
            style={{ height: 30 }}
          />
        </a>
      </div>

      <div className="credits small">
        {i18n.t('footer.version')} <span className="name">{version}</span>
        {showWhatsNew && (
          <>
            {' | '}
            <button
              className="whats-new-link"
              onClick={() => openTab(chrome.runtime.getURL('whats-new.html'))}>
              {i18n.t('footer.whatsNew')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ExtensionFooter
