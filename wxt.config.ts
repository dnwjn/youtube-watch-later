import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  // Keep the existing build/<browser>-mv<n>-prod.zip layout the workflows use.
  outDir: 'build',
  zip: {
    artifactTemplate: '{{browser}}-{{manifestVersion}}-prod.zip',
  },
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/auto-icons',
    '@wxt-dev/i18n/module',
  ],
  alias: {
    '~': 'src',
    '@root': '.',
  },
  autoIcons: {
    baseIconPath: '../assets/icon.png',
  },
  manifest: {
    default_locale: 'en',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    browser_specific_settings: {
      gecko: {
        id: '{767563c0-f773-41a2-afa9-e36cc0d49c31}',
      },
    },
    host_permissions: [
      'https://www.youtube.com/*',
      'https://m.youtube.com/*',
      'https://*.youtube.com/*',
    ],
    permissions: ['cookies', 'storage'],
  },
})
