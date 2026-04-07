import { sendToBackgroundViaRelay } from '@plasmohq/messaging'

import type { VisitorCookies } from '~interfaces'

const sha1 = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const getAuthorizationHeader = async () => {
  let cookies: VisitorCookies

  try {
    cookies = await sendToBackgroundViaRelay<VisitorCookies>({
      name: 'visitor-cookie',
    })
  } catch (error) {
    throw new Error('Visitor cookie not found. Reason: ' + error)
  }

  if (!cookies?.sapisid) {
    throw new Error('Visitor cookie not found. Reason: no value')
  }

  const origin = 'https://www.youtube.com'
  const time = Math.floor(Date.now() / 1000)

  const computeHash = async (cookieValue: string) =>
    `${time}_${await sha1(`${time} ${cookieValue} ${origin}`)}`

  const parts = [`SAPISIDHASH ${await computeHash(cookies.sapisid)}`]

  if (cookies.sapisid1p) {
    parts.push(`SAPISID1PHASH ${await computeHash(cookies.sapisid1p)}`)
  }
  if (cookies.sapisid3p) {
    parts.push(`SAPISID3PHASH ${await computeHash(cookies.sapisid3p)}`)
  }

  return parts.join(' ')
}

export const getHostname = () => {
  const hostname = window.location.hostname
  return hostname.includes('youtube.com') ? hostname : 'www.youtube.com'
}
