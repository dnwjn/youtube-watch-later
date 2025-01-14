export interface YTData {
  authUser: string | null
  clientTheme: string | null
  clientVersion: string | null
  loggedIn: boolean
  pageId: string | null
  visitorId: string | null
}

export interface Settings {
  buttonOpacity: string
  buttonPosition: string
  loggingEnabled: boolean
  markNotificationsAsRead: boolean
}

export interface ButtonConfig {
  opacity: string
  position: string
}
