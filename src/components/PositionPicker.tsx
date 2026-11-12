import React from 'react'

import type { MessageKey } from '~/helpers/i18n'
import useI18n from '~/hooks/useI18n'
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

const cornerLabel = (position: string, t: (key: MessageKey) => string) => {
  switch (position) {
    case ButtonPosition.TopLeft:
      return t('buttonPosition.corner.topLeft')
    case ButtonPosition.TopRight:
      return t('buttonPosition.corner.topRight')
    case ButtonPosition.BottomLeft:
      return t('buttonPosition.corner.bottomLeft')
    default:
      return t('buttonPosition.corner.bottomRight')
  }
}

const PositionPicker = ({ value, allowed, onChange }: Props) => {
  const { t } = useI18n()
  return (
    <div className="position-picker">
      {allowed.map((position) => (
        <button
          key={position}
          type="button"
          aria-label={cornerLabel(position, t)}
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
