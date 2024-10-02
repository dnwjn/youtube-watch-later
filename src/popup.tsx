import packageJson from '@root/package.json'
import logo from 'data-base64:@root/assets/icon.png'
import React, { useEffect, useMemo, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import { getActiveTab, openTab } from '~helpers'

import '~css/popup.css'

const Popup = () => {
  const [enabled, setEnabled] = useState<boolean>(false)
  const [isLogging, setIsLogging] = useStorage<boolean>('isLogging', false)

  const version = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      return 'DEV'
    }

    return `v${packageJson.version}`
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

        <h1 className="title">YT Watch Later</h1>
      </div>

      <div className="content">
        <h2 className="title">
          Status:{' '}
          <span
            className={`extension-status ${enabled ? 'enabled' : 'disabled'}`}></span>
        </h2>

        <p className="instruction">Extension only works on YouTube.com.</p>
      </div>

      <div className="content">
        <h2 className="title">Settings</h2>

        <p className="instruction">Click a setting to change it.</p>

        <button className="setting" onClick={() => setIsLogging(!isLogging)}>
          <div className="default">
            Logging is{' '}
            <span className="status">{isLogging ? 'enabled' : 'disabled'}</span>
          </div>
          <div className="hover">
            <span className="status">{isLogging ? 'Disable' : 'Enable'}</span>{' '}
            logging
          </div>
        </button>
      </div>

      <div className="content">
        <h2 className="title">Issues?</h2>

        <p className="instruction">
          If you encounter any issues, please report them on GitHub:
        </p>

        <button
          className="setting bold"
          onClick={() => openTab('https://github.com/dnwjn/yt-watch-later')}>
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
