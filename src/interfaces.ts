export interface YTData {
  authUser: string | null
  clientTheme: string | null
  clientVersion: string | null
  pageId: string | null
  visitorId: string | null
}

export interface MarkNotifReadEventDetail {
  xpath: string
  authorizationHeader: string
  ytData: YTData
  loggingEnabled: boolean
}
