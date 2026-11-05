// MAIN-world scripts have no access to extension APIs, so requests travel
// page -> isolated content script (`startRelay`) -> background. Message names
// are shared by both ends.
export type MessageName = 'settings' | 'visitor-cookie'

type RelayRequest = {
  ytwl: 'request'
  id: string
  name: MessageName
}

type RelayResponse = {
  ytwl: 'response'
  id: string
  data?: unknown
  error?: string
}

const RELAY_TIMEOUT_MS = 10000

export const sendToBackgroundViaRelay = <T>(request: {
  name: MessageName
}): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const id = crypto.randomUUID()

    const timeout = setTimeout(() => {
      window.removeEventListener('message', onMessage)
      reject(new Error(`No response for "${request.name}"`))
    }, RELAY_TIMEOUT_MS)

    const onMessage = (event: MessageEvent) => {
      const message = event.data as RelayResponse | undefined

      if (event.source !== window) return
      if (message?.ytwl !== 'response' || message.id !== id) return

      clearTimeout(timeout)
      window.removeEventListener('message', onMessage)

      if (message.error) reject(new Error(message.error))
      else resolve(message.data as T)
    }

    window.addEventListener('message', onMessage)
    window.postMessage(
      { ytwl: 'request', id, name: request.name } satisfies RelayRequest,
      window.location.origin,
    )
  })

// Runs in the isolated world; `forward` talks to the background.
export const startRelay = (
  forward: (name: MessageName) => Promise<unknown>,
) => {
  window.addEventListener('message', async (event: MessageEvent) => {
    const message = event.data as RelayRequest | undefined

    if (event.source !== window || message?.ytwl !== 'request') return

    const response: RelayResponse = { ytwl: 'response', id: message.id }

    try {
      response.data = await forward(message.name)
    } catch (error) {
      response.error = error instanceof Error ? error.message : String(error)
    }

    window.postMessage(response, window.location.origin)
  })
}
