export interface YTData {
  authUser: string | null
  clientTheme: string | null
  clientVersion: string | null
  pageId: string | null
  visitorId: string | null
}

export interface Settings {
  loggingEnabled: boolean
  markNotificationsAsRead: boolean
  analyticsEnabled: boolean
}
