import { useCallback, useEffect, useState } from 'react'

import { getStored, setStored, watchStored } from '~/helpers/storage'

type StorageMeta = { isLoading: boolean }

const useStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => Promise<void>, StorageMeta] => {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      const stored = await getStored<T>(key)

      if (!active) return
      setValue(stored ?? initialValue)
      setIsLoading(false)
    }

    load()
    const unwatch = watchStored([key], load)

    return () => {
      active = false
      unwatch()
    }
    // initialValue is a default, not a dependency that should re-trigger loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    async (next: T) => {
      setValue(next)
      await setStored(key, next)
    },
    [key],
  )

  return [value, update, { isLoading }]
}

export default useStorage
