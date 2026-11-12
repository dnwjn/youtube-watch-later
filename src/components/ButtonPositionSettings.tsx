import { i18n } from '#i18n'
import React from 'react'

import PositionPicker from '~/components/PositionPicker'
import useStorage from '~/hooks/useStorage'
import {
  buttonPositionAllowed,
  ButtonPositionContext,
  buttonPositionDefault,
} from '~/types'

const locations = [
  { context: ButtonPositionContext.Thumbnail, key: 'thumbnail' },
  { context: ButtonPositionContext.Playlist, key: 'playlist' },
  { context: ButtonPositionContext.EndscreenModern, key: 'endscreenModern' },
  { context: ButtonPositionContext.Sidebar, key: 'sidebar' },
  { context: ButtonPositionContext.Notification, key: 'notification' },
  { context: ButtonPositionContext.Endscreen, key: 'endscreen' },
] as const

interface LocationSettingProps {
  context: string
  label: string
  description: string
}

const LocationSetting = ({
  context,
  label,
  description,
}: LocationSettingProps) => {
  const [position, setPosition, { isLoading }] = useStorage<string>(
    context,
    buttonPositionDefault[context],
  )

  return (
    <div className="setting">
      <h3 className="title">{label}</h3>

      {isLoading ? (
        <div className="position-picker" />
      ) : (
        <PositionPicker
          value={position}
          allowed={buttonPositionAllowed[context]}
          onChange={setPosition}
        />
      )}

      <p className="instruction spacing">{description}</p>
    </div>
  )
}

const ButtonPositionSettings = () => {
  return (
    <div className="content">
      <h2 className="title">{i18n.t('buttonPosition.title')}</h2>

      {locations.map(({ context, key }) => (
        <LocationSetting
          key={context}
          context={context}
          label={i18n.t(`buttonPosition.${key}.label`)}
          description={i18n.t(`buttonPosition.${key}.description`)}
        />
      ))}
    </div>
  )
}

export default ButtonPositionSettings
