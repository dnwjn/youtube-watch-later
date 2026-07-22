import React from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import PositionPicker from '~components/PositionPicker'
import {
  buttonPositionAllowed,
  ButtonPositionContext,
  buttonPositionDefault,
} from '~types'

const locations = [
  {
    context: ButtonPositionContext.Thumbnail,
    label: 'Grid videos',
    description:
      'Videos shown on the home page, channel pages, and search results.',
  },
  {
    context: ButtonPositionContext.Playlist,
    label: 'Playlist videos',
    description: 'Videos shown on a playlist page.',
  },
  {
    context: ButtonPositionContext.EndscreenModern,
    label: 'Endscreen suggestions',
    description: 'Suggested videos shown in the grid when a video ends.',
  },
  {
    context: ButtonPositionContext.Sidebar,
    label: 'Player sidebar',
    description: 'Suggested videos shown next to the video player.',
  },
  {
    context: ButtonPositionContext.Notification,
    label: 'Notifications',
    description: 'Videos shown in the notification drawer.',
  },
  {
    context: ButtonPositionContext.Endscreen,
    label: 'Old endscreen suggestions',
    description: 'Suggested videos shown in the older endscreen layout.',
  },
]

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
      <h2 className="title">Button position</h2>

      {locations.map(({ context, label, description }) => (
        <LocationSetting
          key={context}
          context={context}
          label={label}
          description={description}
        />
      ))}
    </div>
  )
}

export default ButtonPositionSettings
