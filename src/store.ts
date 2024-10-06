import { create } from 'zustand'

import type { YTData } from '~interfaces'

interface WatchLaterState {
  ytData: YTData | null
  url: string | null
  enabled: boolean
  setYtData: (ytData: YTData) => void
  setUrl: (url: string) => void
  setEnabled: (enabled: boolean) => void
}

export const useWatchLaterStore = create<WatchLaterState>((set) => ({
  ytData: null,
  url: null,
  enabled: false,
  setYtData: (ytData: YTData) => set({ ytData }),
  setUrl: (url: string) => set({ url }),
  setEnabled: (enabled: boolean) => set({ enabled }),
}))
