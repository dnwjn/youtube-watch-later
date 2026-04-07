import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const cookieStoreId = (req.sender?.tab as any)?.cookieStoreId as string | undefined

  const sapisidCookie = await new Promise<string | null>((resolve, reject) => {
    chrome.cookies.get(
      {
        url: 'https://www.youtube.com',
        name: 'SAPISID',
        ...(cookieStoreId ? { storeId: cookieStoreId } : {}),
      },
      (cookie) => {
        if (cookie) {
          resolve(cookie.value)
        } else {
          reject('SAPISID cookie not found')
        }
      },
    )
  })

  res.send(sapisidCookie)
}

export default handler
