import React, { useEffect, useState } from 'react'

import ButtonPositionSettings from '~/components/ButtonPositionSettings'
import Dropdown from '~/components/Dropdown'
import ExtensionFooter from '~/components/ExtensionFooter'
import ExtensionHeader from '~/components/ExtensionHeader'
import { openTab } from '~/helpers/browser'
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGES,
  type Language,
} from '~/helpers/i18n'
import useI18n from '~/hooks/useI18n'
import useStorage from '~/hooks/useStorage'
import { ButtonOpacity, ButtonVisibility } from '~/types'

import '~/css/popup.css'

const Popup = () => {
  const { t, language } = useI18n()
  const [, setLanguage] = useStorage<Language>('language', DEFAULT_LANGUAGE)

  useEffect(() => {
    document.title = t('popup.title')
  }, [t])
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
          title={t('buttonPosition.title')}
          onBack={() => setView('main')}
        />

        <ButtonPositionSettings />

        <ExtensionFooter />
      </div>
    )
  }

  return (
    <div className="popup-root">
      <ExtensionHeader title={t('popup.title')} />

      <div className="content">
        <h2 className="title">{t('popup.general.title')}</h2>

        <div className="setting">
          <h3 className="title">{t('popup.general.markRead.title')}</h3>

          <button
            className="button"
            onClick={() =>
              setMarkNotificationsAsRead(!markNotificationsAsRead)
            }>
            <div className="default">
              <span className="status">
                {markNotificationsAsRead
                  ? t('common.enabled')
                  : t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {markNotificationsAsRead
                  ? t('common.disable')
                  : t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {t('popup.general.markRead.description')}
          </p>

          <p className="instruction spacing">
            {t('popup.general.markRead.scope')}
          </p>
        </div>

        <div className="setting">
          <h3 className="title">{t('popup.general.logging.title')}</h3>

          <button className="button" onClick={() => setIsLogging(!isLogging)}>
            <div className="default">
              <span className="status">
                {isLogging ? t('common.enabled') : t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {isLogging ? t('common.disable') : t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {t('popup.general.logging.description')}
          </p>
        </div>

        <div className="setting">
          <h3 className="title">{t('popup.general.whatsNew.title')}</h3>

          <button
            className="button"
            onClick={() => setOpenWhatsNewOnUpdate(!openWhatsNewOnUpdate)}>
            <div className="default">
              <span className="status">
                {openWhatsNewOnUpdate
                  ? t('common.enabled')
                  : t('common.disabled')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {openWhatsNewOnUpdate
                  ? t('common.disable')
                  : t('common.enable')}
              </span>
            </div>
          </button>

          <p className="instruction spacing">
            {t('popup.general.whatsNew.description')}
          </p>
        </div>

        <div className="setting">
          <h3 className="title" id="language-title">
            {t('popup.general.language.title')}
          </h3>

          <Dropdown
            value={language}
            labelledBy="language-title"
            options={[
              { value: 'auto', label: t('popup.general.language.auto') },
              ...Object.entries(LANGUAGES).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={(value) => {
              if (isLanguage(value)) setLanguage(value)
            }}
          />

          <p className="instruction spacing">
            {t('popup.general.language.description')}
          </p>
        </div>
      </div>

      <div className="content">
        <h2 className="title">{t('popup.button.title')}</h2>

        <p className="instruction">{t('popup.button.scope')}</p>

        <div className="setting">
          <h3 className="title">{t('popup.button.visibility.title')}</h3>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Always}
            onClick={() => setButtonVisibility(ButtonVisibility.Always)}>
            <div className="default">
              <span className="status">
                {t('popup.button.visibility.always')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {t('popup.button.visibility.alwaysChange')}
              </span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonVisibility === ButtonVisibility.Hover}
            onClick={() => setButtonVisibility(ButtonVisibility.Hover)}>
            <div className="default">
              <span className="status">
                {t('popup.button.visibility.hover')}
              </span>
            </div>
            <div className="hover">
              <span className="status">
                {t('popup.button.visibility.hoverChange')}
              </span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">{t('popup.button.opacity.title')}</h3>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Full}
            onClick={() => setButtonOpacity(ButtonOpacity.Full)}>
            <div className="default">
              <span className="status">{t('popup.button.opacity.full')}</span>
            </div>
            <div className="hover">
              <span className="status">
                {t('popup.button.opacity.fullChange')}
              </span>
            </div>
          </button>

          <button
            className="button w-half"
            disabled={buttonOpacity === ButtonOpacity.Half}
            onClick={() => setButtonOpacity(ButtonOpacity.Half)}>
            <div className="default">
              <span className="status">{t('popup.button.opacity.half')}</span>
            </div>
            <div className="hover">
              <span className="status">
                {t('popup.button.opacity.halfChange')}
              </span>
            </div>
          </button>
        </div>

        <div className="setting">
          <h3 className="title">{t('popup.button.position.title')}</h3>

          <button className="button" onClick={() => setView('positions')}>
            <span className="status">{t('popup.button.position.link')}</span>
          </button>
        </div>
      </div>

      <div className="content">
        <h2 className="title">{t('popup.contact.title')}</h2>

        <p className="instruction">{t('popup.contact.description')}</p>

        <button
          className="button bold"
          onClick={() => openTab('https://youtube-watch-later.com')}>
          {t('popup.contact.website')}
        </button>
      </div>

      <ExtensionFooter showWhatsNew />
    </div>
  )
}

export default Popup
