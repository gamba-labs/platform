import { create } from 'zustand'

export interface Toast {
  id: string
  title: string
  description: string
  link?: string
}

export type ToastInput = Omit<Toast, 'id'>

interface ToastStore {
  toasts: Toast[]

  discard: (id: string) => void

  add: (toast: ToastInput) => void
}

export const useToastStore = create<ToastStore>(
  (set, get) => ({
    toasts: [],

    discard: (id) => {
      set({ toasts: get().toasts.filter((x) => x.id !== id) })
    },

    add: (toast) => {
      set({ toasts: [...get().toasts, { ...toast, id: String(Math.random()) }] })
    },
  }),
)

export function useToast() {
  return useToastStore(state => state.add)
}
