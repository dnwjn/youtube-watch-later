import React, { useEffect, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import ButtonPositionSettings from '~components/ButtonPositionSettings'
import ExtensionFooter from '~components/ExtensionFooter'
import ExtensionHeader from '~components/ExtensionHeader'
import { openTab } from '~helpers/browser'
import { ButtonOpacity, ButtonVisibility } from '~types'

import '~css/popup.css'

const Popup = () => {
  const [view, setView] = useState<'main' | 'positions'>('main')

  useEffect(() => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [view])

  const [isLogging, setIsLogging] = useStorage<boolean>('isLogging', false)
  const [markNotificationsAsRead, setMarkNotificationsAsRead] =
    useStorage<boolean>('markNotificationsAsRead', false)
  const [buttonVisibility, setButtonVisibility] = useStorage<string>(
    'buttonVisibility',
    ButtonVisibility.Always,
  )
  const [buttonOpacity, setButtonOpacity] = useStorage<string>(
    'buttonOpacity',
    ButtonOpacity.Full,
  )

  if (view === 'positions') {
    return (
      <div className="popup-root">
        <ExtensionHeader
          title="Button position"
          onBack={() => setView('main')}
        />

        <ButtonPositionSettings />

        <ExtensionFooter />
      </div>
    )
  }

  return (
    <div className="popup-root">
      <ExtensionHeader title="YouTube Watch Later" />

      <div className="content">
        <h2 className="title">General settings</h2>

        <div className="setting">
          <h3 className="title">Mark notifications as read</h3>

          <button
            className="button"
            onClick={() =>
              setMarkNotificationsAsRead(!markNotificationsAsRead)
            }>
            <div className="default">
              <span className="status">
                {markNotificationsAsRead ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {markNotificationsAsRead ? 'Disable' : 'Enable'}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            When enabled, notifications will be marked as read when you add them
            to Watch Later.
          </p>

          <p className="instruction spacing">
            This setting only affects the button inside the notification drawer.
          </p>
        </div>

        <div className="setting">
          <h3 className="title">Logging</h3>

          <button className="button" onClick={() => setIsLogging(!isLogging)}>
            <div className="default">
              <span className="status">
                {isLogging ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="hover">
              <span className="status">{isLogging ? 'Disable' : 'Enable'}</span>
            </div>
          </button>

          <p className="instruction spacing">
            When enabled, logs will be shown in the console.
          </p>
        </div>
      </div>

      <div className="content">
        <h2 className="title">Button settings</h2>

        <p className="instruction">
          These settings do not affect the button inside the video player
          controls or in suggested videos on mobile.
        </p>

        <div className="setting">
          <h3 className="title">Button visibility</h3>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Always}
            onClick={() => setButtonVisibility(ButtonVisibility.Always)}>
            <div className="default">
              <span className="status">Always</span>
            </div>
            <div className="hover">
              <span className="status">Change to always</span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Hover}
            onClick={() => setButtonVisibility(ButtonVisibility.Hover)}>
            <div className="default">
              <span className="status">Hover</span>
            </div>
            <div className="hover">
              <span className="status">Change to hover</span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">Button opacity</h3>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Full}
            onClick={() => setButtonOpacity(ButtonOpacity.Full)}>
            <div className="default">
              <span className="status">Full</span>
            </div>
            <div className="hover">
              <span className="status">Change to full</span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Half}
            onClick={() => setButtonOpacity(ButtonOpacity.Half)}>
            <div className="default">
              <span className="status">Half</span>
            </div>
            <div className="hover">
              <span className="status">Change to half</span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">Button position</h3>

          <button className="button" onClick={() => setView('positions')}>
            <span className="status">Button position settings →</span>
          </button>
        </div>
      </div>

      <div className="content">
        <h2 className="title">Contact</h2>

        <p className="instruction">
          Do you have a suggestion, an issue, or do you just want to say thank
          you?
        </p>

        <button
          className="button bold"
          onClick={() => openTab('https://youtube-watch-later.com')}>
          Visit website
        </button>
      </div>

      <ExtensionFooter />
    </div>
  )
}

export default Popup
