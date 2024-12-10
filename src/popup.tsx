import packageJson from '@root/package.json'
import logo from 'data-base64:@root/assets/icon.png'
import React, { useEffect, useMemo, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import { getActiveTab, openTab } from '~helpers/browser'

import '~css/popup.css'

const Popup = () => {
  const [enabled, setEnabled] = useState<boolean>(false)
  const [isLogging, setIsLogging] = useStorage<boolean>('isLogging', false)
  const [markNotificationsAsRead, setMarkNotificationsAsRead] =
    useStorage<boolean>('markNotificationsAsRead', false)

  const version = useMemo(() => {
    if (process.env.NODE_ENV === 'production') {
      return `v${packageJson.version}`
    }

    return 'DEV'
  }, [process.env.NODE_ENV, packageJson.version])

  const checkIfEnabled = async () => {
    const activeTab = await getActiveTab()
    const url = activeTab?.url
    const _enabled = url?.match(/youtube\.com/) !== null
    setEnabled(_enabled)
  }

  useEffect(() => {
    checkIfEnabled()
  }, [])

  return (
    <div className="root">
      <div className="header">
        <img className="logo" src={logo} alt="logo" />

        <h1 className="title">YouTube Watch Later</h1>
      </div>

      <div className="content">
        <h2 className="title">Settings</h2>

        <p className="instruction">Click a setting to change it.</p>

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
            When enabled, notifications will be marked as read when you add them to Watch Later.
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
        <h2 className="title">Issues?</h2>

        {/* TODO: Link to website when it has a form */}
        <p className="instruction">
          If you encounter any issues, please report them on GitHub:
        </p>

        <button
          className="button bold"
          onClick={() => openTab('https://github.com/dnwjn/youtube-watch-later')}>
          Go to GitHub
        </button>
      </div>

      <div className="footer">
        <a className="credits" href="https://github.com/dnwjn">
          Crafted with ❤️ + 💻 + 🧠 by <span className="name">dnwjn</span>
        </a>

        <div className="credits small">
          Version: <span className="name">{version}</span>
        </div>
      </div>
    </div>
  )
}

export default Popup
