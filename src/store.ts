import { create } from 'zustand'

import type { YTData } from '~interfaces'

interface WatchLaterState {
  ytData: YTData | null
  url: string | null
  enabled: boolean
  latestElementRef: HTMLElement | null
  videoPreviewIsHovered: boolean
  addedVideoIds: Set<string>
  setYtData: (ytData: YTData) => void
  setUrl: (url: string) => void
  setEnabled: (enabled: boolean) => void
  setLatestElementRef: (el: HTMLElement) => void
  setVideoPreviewIsHovered: (hovered: boolean) => void
  markVideoAsAdded: (videoId: string) => void
}

export const useWatchLaterStore = create<WatchLaterState>((set) => ({
  ytData: null,
  url: null,
  enabled: false,
  latestElementRef: null,
  videoPreviewIsHovered: false,
  addedVideoIds: new Set(),
  setYtData: (ytData: YTData) => set({ ytData }),
  setUrl: (url: string) => set({ url }),
  setEnabled: (enabled: boolean) => set({ enabled }),
  setLatestElementRef: (el: HTMLElement) => set({ latestElementRef: el }),
  setVideoPreviewIsHovered: (hovered: boolean) =>
    set({ videoPreviewIsHovered: hovered }),
  markVideoAsAdded: (videoId: string) =>
    set((state) => {
      const addedVideoIds = new Set(state.addedVideoIds)
      addedVideoIds.add(videoId)
      return { addedVideoIds }
    }),
}))
