import { useState, type FormEvent } from 'react'
import { useSettings } from '../context/SettingsContext'
import { fmtKg, naira, statusLabel, waLink } from '../lib/format'
import { supabase } from '../lib/supabase'

interface OrderView {
  reference: string
  status: string
  total: number
  created_at: string
  items: { product_name: string; quantity_kg: number; line_total: number }[]
}

export default function MyOrders() {
  const { whatsapp } = useSettings()
  const [reference, setReference] = useState(() => {
    try { return localStorage.getItem('istom-last-order') ?? '' } catch { return '' }
  })
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<OrderView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const lookup = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setOrder(null); setBusy(true)
    const { data, error } = await supabase.functions.invoke('get-order', {
      body: { reference: reference.trim().toUpperCase(), phone: phone.replace(/[\s-]/g, '') },
    })
    setBusy(false)
    if (error || !data?.order) { setError('We could not find that order. Check the order ID and the phone number you used.'); return }
    setOrder(data.order as OrderView)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-neutral-600">Enter your order ID and the phone number you ordered with.</p>
      <form onSubmit={lookup} className="mt-6 space-y-3">
        <input className="input" placeholder="Order ID, e.g. IST-1A2B3C4D" value={reference} onChange={(e) => setReference(e.target.value)} required aria-label="Order ID" />
        <input className="input" type="tel" inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required aria-label="Phone number" />
        <button type="submit" disabled={busy} className="btn-red w-full">{busy ? 'Looking up...' : 'Find my order'}</button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}

      {order && (
        <div className="mt-6 space-y-3 rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">{order.reference}</p>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-red">{statusLabel[order.status] ?? order.status}</span>
          </div>
          <ul className="space-y-1 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between"><span>{i.product_name} ({fmtKg(i.quantity_kg)})</span><span>{naira(i.line_total)}</span></li>
            ))}
          </ul>
          <p className="border-t pt-2 text-right font-extrabold text-brand-red">Total {naira(order.total)}</p>
          {order.status !== 'pending_payment' && order.status !== 'cancelled' && (
            <a className="btn w-full bg-green-600 text-white hover:bg-green-700" target="_blank" rel="noreferrer"
              href={waLink(whatsapp, `Hello Istom Foods, my order ID is ${order.reference}.`)}>Message us on WhatsApp with this order ID</a>
          )}
        </div>
      )}
    </div>
  )
}
