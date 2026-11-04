import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '../types'

const STORAGE_KEY = 'istom-cart'

export const lineTotal = (i: CartItem) =>
  i.mode === 'amount' ? i.qty : Math.round(i.qty * i.pricePerKg)
export const lineKg = (i: CartItem) => (i.mode === 'amount' ? i.qty / i.pricePerKg : i.qty)

interface CartCtx {
  items: CartItem[]
  count: number
  subtotal: number
  add: (item: Omit<CartItem, 'key'>) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* storage full or blocked */ }
  }, [items])

  const value = useMemo<CartCtx>(() => ({
    items,
    count: items.length,
    subtotal: items.reduce((s, i) => s + lineTotal(i), 0),
    add: (item) => {
      const key = `${item.productId}-${item.mode}`
      setItems((prev) => {
        const found = prev.find((p) => p.key === key)
        if (found) return prev.map((p) => (p.key === key ? { ...p, qty: p.qty + item.qty, pricePerKg: item.pricePerKg } : p))
        return [...prev, { ...item, key }]
      })
    },
    setQty: (key, qty) => setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty } : p))),
    remove: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
    clear: () => setItems([]),
  }), [items])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
