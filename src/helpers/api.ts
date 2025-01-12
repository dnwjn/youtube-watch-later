import { sendToBackgroundViaRelay } from "@plasmohq/messaging"

const sha1 = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const getAuthorizationHeader = async () => {
  let sapisidCookie: string | null

  try {
    sapisidCookie = await sendToBackgroundViaRelay<string | null>({
      name: 'visitor-cookie',
    })
  } catch (error) {
    throw new Error('Visitor cookie not found. Reason: ' + error)
  }

  if (!sapisidCookie) {
    throw new Error('Visitor cookie not found. Reason: no value')
  }

  const sapisid = sapisidCookie
  const origin = 'https://www.youtube.com'
  const time = Math.floor(Date.now() / 1000)
  const hash = await sha1(`${time} ${sapisid} ${origin}`)
  const authorizationHeader = `${time}_${hash}`

  return authorizationHeader
}