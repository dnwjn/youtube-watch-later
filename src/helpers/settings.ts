import type { Settings } from '~/interfaces'
import { ButtonPositionContext, buttonPositionDefault } from '~/types'

import { getStored } from './storage'

const buttonPosition = async (context: string): Promise<string> => {
  const position = await getStored<string>(context)

  return position || buttonPositionDefault[context]
}

export const readSettings = async (): Promise<Settings> => ({
  buttonOpacity: (await getStored<string>('buttonOpacity')) as string,
  buttonPositionThumbnail: await buttonPosition(
    ButtonPositionContext.Thumbnail,
  ),
  buttonPositionPlaylist: await buttonPosition(ButtonPositionContext.Playlist),
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
  buttonVisibility: (await getStored<string>('buttonVisibility')) as string,
  loggingEnabled: (await getStored<boolean>('isLogging')) as boolean,
  markNotificationsAsRead: (await getStored<boolean>(
    'markNotificationsAsRead',
  )) as boolean,
})
