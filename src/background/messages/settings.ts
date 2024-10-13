import type { PlasmoMessaging } from '@plasmohq/messaging'
import { Storage } from '@plasmohq/storage'

import type { Settings } from '~interfaces'

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
    loggingEnabled: await loggingEnabled(),
    markNotificationsAsRead: await markNotificationsAsRead(),
  }

  res.send(settings)
}

export default handler
