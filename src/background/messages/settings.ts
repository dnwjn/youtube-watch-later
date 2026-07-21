import type { PlasmoMessaging } from '@plasmohq/messaging'
import { Storage } from '@plasmohq/storage'

import type { Settings } from '~interfaces'
import { ButtonPositionContext, buttonPositionDefault } from '~types'

const buttonOpacity = async (): Promise<string> => {
  const storage = new Storage()
  const buttonOpacity: string = await storage.get('buttonOpacity')

  return buttonOpacity
}

const buttonPosition = async (context: string): Promise<string> => {
  const storage = new Storage()
  const position: string = await storage.get(context)

  return position || buttonPositionDefault[context]
}

const buttonVisibility = async (): Promise<string> => {
  const storage = new Storage()
  const buttonVisibility: string = await storage.get('buttonVisibility')

  return buttonVisibility
}

const loggingEnabled = async (): Promise<boolean> => {
  const storage = new Storage()
  const isLogging: boolean = await storage.get('isLogging')

  return isLogging
}

const markNotificationsAsRead = async (): Promise<boolean> => {
  const storage = new Storage()
  const markNotificationsAsRead: boolean = await storage.get(
    'markNotificationsAsRead',
  )

  return markNotificationsAsRead
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const settings: Settings = {
    buttonOpacity: await buttonOpacity(),
    buttonPositionThumbnail: await buttonPosition(
      ButtonPositionContext.Thumbnail,
    ),
    buttonPositionPlaylist: await buttonPosition(
      ButtonPositionContext.Playlist,
    ),
    buttonPositionEndscreenModern: await buttonPosition(
      ButtonPositionContext.EndscreenModern,
    ),
    buttonPositionSidebar: await buttonPosition(ButtonPositionContext.Sidebar),
    buttonPositionNotification: await buttonPosition(
      ButtonPositionContext.Notification,
    ),
    buttonPositionEndscreen: await buttonPosition(
      ButtonPositionContext.Endscreen,
    ),
    buttonVisibility: await buttonVisibility(),
    loggingEnabled: await loggingEnabled(),
    markNotificationsAsRead: await markNotificationsAsRead(),
  }

  res.send(settings)
}

export default handler
