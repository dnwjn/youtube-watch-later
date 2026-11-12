import { i18n } from '#i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

document.documentElement.lang = browser.i18n.getUILanguage()
document.title = `${i18n.t('whatsNew.title')}`

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
