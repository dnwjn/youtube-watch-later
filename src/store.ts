import { create } from 'zustand'

import type { YTData } from '~interfaces'

interface WatchLaterState {
  ytData: YTData | null
  setYtData: (ytData: YTData) => void
}

export const useWatchLaterStore = create<WatchLaterState>((set) => ({
  ytData: null,
  setYtData: (ytData: YTData) => set({ ytData }),
}))
