import logo from '@root/assets/icon.png'
import React from 'react'

import useI18n from '~/hooks/useI18n'

import '~/css/shared.css'

interface Props {
  title: string
  subtitle?: string
  onBack?: () => void
}

const ExtensionHeader = ({ title, subtitle, onBack }: Props) => {
  const { t } = useI18n()

  return (
    <div className="header">
      {onBack && (
        <button
          type="button"
          className="back-arrow"
          aria-label={t('common.back')}
          onClick={onBack}>
          ←
        </button>
      )}

      <img className="logo" src={logo} alt={t('common.logoAlt')} />

      <h1 className="title">{title}</h1>

      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

export default ExtensionHeader
