import { i18n } from '#i18n'
import React from 'react'

import { ButtonPosition } from '~/types'

interface Props {
  value: string
  allowed: string[]
  onChange: (value: string) => void
}

const cornerStyle: Record<string, React.CSSProperties> = {
  [ButtonPosition.TopLeft]: { top: 4, left: 4 },
  [ButtonPosition.TopRight]: { top: 4, right: 4 },
  [ButtonPosition.BottomLeft]: { bottom: 4, left: 4 },
  [ButtonPosition.BottomRight]: { bottom: 4, right: 4 },
}

const cornerLabel = (position: string) => {
  switch (position) {
    case ButtonPosition.TopLeft:
      return i18n.t('buttonPosition.corner.topLeft')
    case ButtonPosition.TopRight:
      return i18n.t('buttonPosition.corner.topRight')
    case ButtonPosition.BottomLeft:
      return i18n.t('buttonPosition.corner.bottomLeft')
    default:
      return i18n.t('buttonPosition.corner.bottomRight')
  }
}

const PositionPicker = ({ value, allowed, onChange }: Props) => {
  return (
    <div className="position-picker">
      {allowed.map((position) => (
        <button
          key={position}
          type="button"
          aria-label={cornerLabel(position)}
          aria-pressed={value === position}
          className={
            value === position
              ? 'position-picker-dot active'
              : 'position-picker-dot'
          }
          style={cornerStyle[position]}
          onClick={() => onChange(position)}
        />
      ))}
    </div>
  )
}

export default PositionPicker
