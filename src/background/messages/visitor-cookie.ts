import type { PlasmoMessaging } from '@plasmohq/messaging'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const cookieStoreId = (req.sender?.tab as any)?.cookieStoreId as string | undefined

  const getCookie = (name: string): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.cookies.get(
        {
          url: 'https://www.youtube.com',
          name,
          ...(cookieStoreId ? { storeId: cookieStoreId } : {}),
        },
        (cookie) => resolve(cookie?.value ?? null),
      )
    })
  }

  const [sapisid, sapisid1p, sapisid3p] = await Promise.all([
    getCookie('SAPISID'),
    getCookie('__Secure-1PAPISID'),
    getCookie('__Secure-3PAPISID'),
  ])

  if (!sapisid && !sapisid1p && !sapisid3p) {
    throw new Error('SAPISID cookie not found')
  }

  res.send({ sapisid, sapisid1p, sapisid3p })
}

export default handler
