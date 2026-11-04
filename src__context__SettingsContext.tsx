import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Settings } from '../types'

const defaults: Settings = {
  deliveryFee: 500,
  whatsapp: '2348000000000',
  smallMin: 1500,
  smallStep: 500,
  deliveryArea: 'Ado-Ekiti',
}

const Ctx = createContext<Settings>(defaults)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(defaults)

  useEffect(() => {
    supabase
      .from('settings')
      .select('key,value')
      .then(({ data }) => {
        if (!data) return
        const m: Record<string, string> = {}
        data.forEach((r: { key: string; value: string }) => { m[r.key] = r.value })
        setS({
          deliveryFee: Number(m.delivery_fee ?? defaults.deliveryFee),
          whatsapp: m.whatsapp_number ?? defaults.whatsapp,
          smallMin: Number(m.small_portion_min ?? defaults.smallMin),
          smallStep: Number(m.small_portion_step ?? defaults.smallStep),
          deliveryArea: m.delivery_area ?? defaults.deliveryArea,
        })
      })
  }, [])

  return <Ctx.Provider value={s}>{children}</Ctx.Provider>
}
