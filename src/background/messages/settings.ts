import type { PlasmoMessaging } from '@plasmohq/messaging'
import { Storage } from '@plasmohq/storage'

import type { Settings } from '~interfaces'

const loggingEnabled = async (): Promise<boolean> => {
  const storage = new Storage()
  const isLogging: boolean = await storage.get('isLogging')
  return isLogging
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const settings: Settings = {
    loggingEnabled: await loggingEnabled(),
  }

  res.send(settings)
}

export default handler
