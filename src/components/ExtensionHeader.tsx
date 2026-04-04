import logo from 'data-base64:@root/assets/icon.png'
import React from 'react'

import '~css/shared.css'

interface Props {
  title: string
  subtitle?: string
}

const ExtensionHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="header">
      <img className="logo" src={logo} alt="logo" />

      <h1 className="title">{title}</h1>

      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

export default ExtensionHeader
