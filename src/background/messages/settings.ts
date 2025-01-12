import type { PlasmoMessaging } from '@plasmohq/messaging'
import { Storage } from '@plasmohq/storage'

import type { Settings } from '~interfaces'

const buttonOpacity = async (): Promise<string> => {
  const storage = new Storage()
  const buttonOpacity: string = await storage.get('buttonOpacity')

  return buttonOpacity
}

const buttonPosition = async (): Promise<string> => {
  const storage = new Storage()
  const buttonPosition: string = await storage.get('buttonPosition')

  return buttonPosition
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
    buttonPosition: await buttonPosition(),
    loggingEnabled: await loggingEnabled(),
    markNotificationsAsRead: await markNotificationsAsRead(),
  }

  res.send(settings)
}

export default handler
