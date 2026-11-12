import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: '#i18n',
        replacement: path.resolve(__dirname, './src/test/i18n.ts'),
      },
      {
        find: /^~(.*)$/,
        replacement: path.resolve(__dirname, './src') + '/$1',
      },
    ],
  },
})
