import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const getVisitorId = await new Promise<string | null>((resolve, reject) => {
    chrome.cookies.get(
      { url: 'https://www.youtube.com', name: '__Secure-YEC' },
      (cookie) => {
        if (cookie) {
          resolve(cookie.value)
        } else {
          reject('__Secure-YEC cookie not found')
        }
      },
    )
  })

  res.send(getVisitorId)
}

export default handler
