import logo from '@root/assets/icon.png'
import { i18n } from '#i18n'
import React from 'react'

import '~/css/shared.css'

interface Props {
  title: string
  subtitle?: string
  onBack?: () => void
}

const ExtensionHeader = ({ title, subtitle, onBack }: Props) => {
  return (
    <div className="header">
      {onBack && (
        <button
          type="button"
          className="back-arrow"
          aria-label={i18n.t('common.back')}
          onClick={onBack}>
          ←
        </button>
      )}

      <img className="logo" src={logo} alt={i18n.t('common.logoAlt')} />

      <h1 className="title">{title}</h1>

      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

export default ExtensionHeader
