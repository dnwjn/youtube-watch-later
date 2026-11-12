import packageJson from '@root/package.json'
import React, { useMemo } from 'react'

import { openTab } from '~/helpers/browser'
import useI18n from '~/hooks/useI18n'

import '~/css/shared.css'

interface ExtensionFooterProps {
  showWhatsNew?: boolean
}

const ExtensionFooter = ({ showWhatsNew = false }: ExtensionFooterProps) => {
  const { t } = useI18n()
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
        {t('footer.craftedBy')} <span className="name">dnwjn</span>
      </button>

      <div className="bmac">
        <div>{t('footer.enjoying')}</div>
        <div className="bold">{t('footer.free')}</div>
        <div>{t('footer.thanks')}</div>
        <a
          className="bmac-link"
          href="https://coff.ee/dnwjn"
          rel="noopener noreferrer"
          target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt={t('footer.bmacAlt')}
            style={{ height: 30 }}
          />
        </a>
      </div>

      <div className="credits small">
        {t('footer.version')} <span className="name">{version}</span>
        {showWhatsNew && (
          <>
            {' | '}
            <button
              className="whats-new-link"
              onClick={() => openTab(chrome.runtime.getURL('whats-new.html'))}>
              {t('footer.whatsNew')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ExtensionFooter
