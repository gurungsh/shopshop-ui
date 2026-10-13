import { useSyncExternalStore } from 'react'

let unavailable = false
const listeners = new Set<() => void>()

export function setServiceUnavailable(value: boolean) {
  if (unavailable === value) return
  unavailable = value
  listeners.forEach((listener) => {
    listener()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useServiceUnavailable() {
  return useSyncExternalStore(
    subscribe,
    () => unavailable,
    () => false,
  )
}

function subscribeOnline(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

export function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  )
}
