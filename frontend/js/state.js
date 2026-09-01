import { api } from './api.js'

let current = null
const listeners = new Set()

export async function refresh() {
  current = await api.getState()
  listeners.forEach((fn) => fn(current))
  return current
}

export function getCached() {
  return current
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
