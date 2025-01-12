export interface YTData {
  authUser: string | null
  clientTheme: string | null
  clientVersion: string | null
  loggedIn: boolean
  pageId: string | null
  visitorId: string | null
}

export interface Settings {
  buttonPosition: string
  loggingEnabled: boolean
  markNotificationsAsRead: boolean
}
