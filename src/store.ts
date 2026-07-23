import { create } from 'zustand'

import type { YTData } from '~interfaces'

interface WatchLaterState {
  ytData: YTData | null
  url: string | null
  enabled: boolean
  latestElementRef: HTMLElement | null
  videoPreviewIsHovered: boolean
  addedVideoIds: Set<string>
  pendingVideoIds: Set<string>
  erroredVideoIds: Set<string>
  setYtData: (ytData: YTData) => void
  setUrl: (url: string) => void
  setEnabled: (enabled: boolean) => void
  setLatestElementRef: (el: HTMLElement) => void
  setVideoPreviewIsHovered: (hovered: boolean) => void
  markVideoAsPending: (videoId: string) => void
  markVideoAsAdded: (videoId: string) => void
  markVideoAsErrored: (videoId: string) => void
  clearVideoError: (videoId: string) => void
}

export const useWatchLaterStore = create<WatchLaterState>((set) => ({
  ytData: null,
  url: null,
  enabled: false,
  latestElementRef: null,
  videoPreviewIsHovered: false,
  addedVideoIds: new Set(),
  pendingVideoIds: new Set(),
  erroredVideoIds: new Set(),
  setYtData: (ytData: YTData) => set({ ytData }),
  setUrl: (url: string) => set({ url }),
  setEnabled: (enabled: boolean) => set({ enabled }),
  setLatestElementRef: (el: HTMLElement) => set({ latestElementRef: el }),
  setVideoPreviewIsHovered: (hovered: boolean) =>
    set({ videoPreviewIsHovered: hovered }),
  // These three keep a video's in-flight/added/errored status keyed by id
  // (not tied to a specific button component instance) so that a button
  // torn down and remounted mid-request or mid-error-display picks its
  // status back up instead of losing it, the same way `addedVideoIds`
  // already lets successful adds survive a remount.
  markVideoAsPending: (videoId: string) =>
    set((state) => {
      const pendingVideoIds = new Set(state.pendingVideoIds)
      pendingVideoIds.add(videoId)
      return { pendingVideoIds }
    }),
  markVideoAsAdded: (videoId: string) =>
    set((state) => {
      const addedVideoIds = new Set(state.addedVideoIds)
      addedVideoIds.add(videoId)
      const pendingVideoIds = new Set(state.pendingVideoIds)
      pendingVideoIds.delete(videoId)
      const erroredVideoIds = new Set(state.erroredVideoIds)
      erroredVideoIds.delete(videoId)
      return { addedVideoIds, pendingVideoIds, erroredVideoIds }
    }),
  markVideoAsErrored: (videoId: string) =>
    set((state) => {
      const pendingVideoIds = new Set(state.pendingVideoIds)
      pendingVideoIds.delete(videoId)
      const erroredVideoIds = new Set(state.erroredVideoIds)
      erroredVideoIds.add(videoId)
      return { pendingVideoIds, erroredVideoIds }
    }),
  clearVideoError: (videoId: string) =>
    set((state) => {
      const erroredVideoIds = new Set(state.erroredVideoIds)
      erroredVideoIds.delete(videoId)
      return { erroredVideoIds }
    }),
}))
