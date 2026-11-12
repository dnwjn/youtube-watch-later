import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import '@testing-library/jest-dom/vitest'

// WXT auto-imports `browser` in the extension; tests get a minimal stand-in.
vi.stubGlobal('browser', { i18n: { getUILanguage: () => 'en' } })
vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      sync: { get: async () => ({}), set: async () => {} },
      onChanged: { addListener: () => {}, removeListener: () => {} },
    },
  },
}))

afterEach(() => {
  cleanup()
})
