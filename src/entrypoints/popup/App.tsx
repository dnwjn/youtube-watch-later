import { i18n } from '#i18n'
import React, { useEffect, useState } from 'react'

import ButtonPositionSettings from '~/components/ButtonPositionSettings'
import ExtensionFooter from '~/components/ExtensionFooter'
import ExtensionHeader from '~/components/ExtensionHeader'
import { openTab } from '~/helpers/browser'
import useStorage from '~/hooks/useStorage'
import { ButtonOpacity, ButtonVisibility } from '~/types'

import '~/css/popup.css'

const Popup = () => {
  const [view, setView] = useState<'main' | 'positions'>('main')

  useEffect(() => {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [view])

  const [isLogging, setIsLogging] = useStorage<boolean>('isLogging', false)
  const [markNotificationsAsRead, setMarkNotificationsAsRead] =
    useStorage<boolean>('markNotificationsAsRead', false)
  const [openWhatsNewOnUpdate, setOpenWhatsNewOnUpdate] = useStorage<boolean>(
    'openWhatsNewOnUpdate',
    true,
  )
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
          title={i18n.t('buttonPosition.title')}
          onBack={() => setView('main')}
        />

        <ButtonPositionSettings />

        <ExtensionFooter />
      </div>
    )
  }

  return (
    <div className="popup-root">
      <ExtensionHeader title={i18n.t('popup.title')} />

      <div className="content">
        <h2 className="title">{i18n.t('popup.general.title')}</h2>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.general.markRead.title')}</h3>

          <button
            className="button"
            onClick={() =>
              setMarkNotificationsAsRead(!markNotificationsAsRead)
            }>
            <div className="default">
              <span className="status">
                {markNotificationsAsRead
                  ? i18n.t('common.enabled')
                  : i18n.t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {markNotificationsAsRead
                  ? i18n.t('common.disable')
                  : i18n.t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {i18n.t('popup.general.markRead.description')}
          </p>

          <p className="instruction spacing">
            {i18n.t('popup.general.markRead.scope')}
          </p>
        </div>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.general.logging.title')}</h3>

          <button className="button" onClick={() => setIsLogging(!isLogging)}>
            <div className="default">
              <span className="status">
                {isLogging
                  ? i18n.t('common.enabled')
                  : i18n.t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {isLogging ? i18n.t('common.disable') : i18n.t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {i18n.t('popup.general.logging.description')}
          </p>
        </div>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.general.whatsNew.title')}</h3>

          <button
            className="button"
            onClick={() => setOpenWhatsNewOnUpdate(!openWhatsNewOnUpdate)}>
            <div className="default">
              <span className="status">
                {openWhatsNewOnUpdate
                  ? i18n.t('common.enabled')
                  : i18n.t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {openWhatsNewOnUpdate
                  ? i18n.t('common.disable')
                  : i18n.t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {i18n.t('popup.general.whatsNew.description')}
          </p>
        </div>
      </div>

      <div className="content">
        <h2 className="title">{i18n.t('popup.button.title')}</h2>

        <p className="instruction">{i18n.t('popup.button.scope')}</p>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.button.visibility.title')}</h3>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Always}
            onClick={() => setButtonVisibility(ButtonVisibility.Always)}>
            <div className="default">
              <span className="status">
                {i18n.t('popup.button.visibility.always')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {i18n.t('popup.button.visibility.alwaysChange')}
              </span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Hover}
            onClick={() => setButtonVisibility(ButtonVisibility.Hover)}>
            <div className="default">
              <span className="status">
                {i18n.t('popup.button.visibility.hover')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {i18n.t('popup.button.visibility.hoverChange')}
              </span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.button.opacity.title')}</h3>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Full}
            onClick={() => setButtonOpacity(ButtonOpacity.Full)}>
            <div className="default">
              <span className="status">
                {i18n.t('popup.button.opacity.full')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {i18n.t('popup.button.opacity.fullChange')}
              </span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Half}
            onClick={() => setButtonOpacity(ButtonOpacity.Half)}>
            <div className="default">
              <span className="status">
                {i18n.t('popup.button.opacity.half')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {i18n.t('popup.button.opacity.halfChange')}
              </span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">{i18n.t('popup.button.position.title')}</h3>

          <button className="button" onClick={() => setView('positions')}>
            <span className="status">
              {i18n.t('popup.button.position.link')}
            </span>
          </button>
        </div>
      </div>

      <div className="content">
        <h2 className="title">{i18n.t('popup.contact.title')}</h2>

        <p className="instruction">{i18n.t('popup.contact.description')}</p>

        <button
          className="button bold"
          onClick={() => openTab('https://youtube-watch-later.com')}>
          {i18n.t('popup.contact.website')}
        </button>
      </div>

      <ExtensionFooter showWhatsNew />
    </div>
  )
}

export default Popup
