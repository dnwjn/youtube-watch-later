import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const sapisidCookie = await new Promise<string | null>((resolve, reject) => {
    chrome.cookies.get(
      { url: 'https://www.youtube.com', name: 'SAPISID' },
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
