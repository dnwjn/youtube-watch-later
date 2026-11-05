import { browser } from 'wxt/browser'

// Values are stored JSON-encoded in `storage.sync` under the raw key, which is
// the format the extension has always used. Keeping it means settings saved by
// earlier versions keep working.
const parse = <T>(raw: unknown): T | undefined => {
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'string') return raw as T

  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

export const getStored = async <T>(key: string): Promise<T | undefined> => {
  const result = await browser.storage.sync.get(key)

  return parse<T>(result[key])
}

export const setStored = async <T>(key: string, value: T): Promise<void> => {
  await browser.storage.sync.set({ [key]: JSON.stringify(value) })
}

export const watchStored = (
  keys: string[],
  callback: (key: string) => void,
): (() => void) => {
  const listener = (
    changes: Record<string, unknown>,
    areaName: string,
  ): void => {
    if (areaName !== 'sync') return

    Object.keys(changes)
      .filter((key) => keys.includes(key))
      .forEach(callback)
  }

  browser.storage.onChanged.addListener(listener)

  return () => browser.storage.onChanged.removeListener(listener)
}
