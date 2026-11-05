import { browser } from 'wxt/browser'

import type { VisitorCookies } from '~/interfaces'

export const readVisitorCookies = async (
  cookieStoreId?: string,
): Promise<VisitorCookies> => {
  const getCookie = async (name: string): Promise<string | null> => {
    const cookie = await browser.cookies.get({
      url: 'https://www.youtube.com',
      name,
      ...(cookieStoreId ? { storeId: cookieStoreId } : {}),
    })

    return cookie?.value ?? null
  }

  const [sapisid, sapisid1p, sapisid3p] = await Promise.all([
    getCookie('SAPISID'),
    getCookie('__Secure-1PAPISID'),
    getCookie('__Secure-3PAPISID'),
  ])

  if (!sapisid && !sapisid1p && !sapisid3p) {
    throw new Error('SAPISID cookie not found')
  }

  return { sapisid, sapisid1p, sapisid3p }
}
