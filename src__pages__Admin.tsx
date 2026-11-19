import { useCallback, useEffect, useState, type FormEvent } from 'react'
import AdminBoard from '../components/AdminBoard'
import { useAuth } from '../context/AuthContext'
import { fmtKg, naira, statusLabel, waLink } from '../lib/format'
import { supabase } from '../lib/supabase'

interface AdminOrder {
  id: string; reference: string; status: string; total: number; created_at: string
  customer_name: string; phone: string; university: string; address: string
  instructions: string | null; payment_method: string
  order_items: { product_name: string; quantity_kg: number; line_total: number }[]
}
interface Summary { total_sales: number; paid_orders: number; awaiting_payment: number }

const toWa = (p: string) => (p.startsWith('0') ? '234' + p.slice(1) : p.replace(/^\+/, ''))
const when = (iso: string) => new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [filter, setFilter] = useState<'awaiting' | 'active' | 'all'>('awaiting')
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [o, s] = await Promise.all([
      supabase.from('orders')
        .select('id,reference,status,total,created_at,customer_name,phone,university,address,instructions,payment_method,order_items(product_name,quantity_kg,line_total)')
        .order('created_at', { ascending: false }).limit(200),
      supabase.from('admin_sales_summary').select('*').maybeSingle(),
    ])
    if (o.error) setError('Could not load orders. Please refresh.')
    else { setError(''); setOrders((o.data ?? []) as AdminOrder[]) }
    if (s.data) setSummary(s.data as Summary)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = async (o: AdminOrder, status: string) => {
    setBusyId(o.id)
    const { error } = await supabase.from('orders').update({ status }).eq('id', o.id)
    if (error) setError('Could not update that order.')
    await load()
    setBusyId('')
  }

  const confirmPayment = async (o: AdminOrder) => {
    if (!window.confirm(`Confirm you received ${naira(o.total)} from ${o.customer_name}? Check your bank app first.`)) return
    setBusyId(o.id)
    const a = await supabase.from('orders').update({ status: 'paid' }).eq('id', o.id)
    const b = await supabase.from('payments').update({ status: 'success', channel: 'bank_transfer', paid_at: new Date().toISOString() }).eq('order_id', o.id)
    if (a.error || b.error) setError('Could not confirm that payment.')
    await load()
    setBusyId('')
  }

  const shown = orders.filter((o) =>
    filter === 'all' ? true : filter === 'awaiting' ? o.status === 'pending_payment' : ['paid', 'processing', 'ready_for_delivery'].includes(o.status))

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-brand-soft p-3"><p className="text-xs text-neutral-600">Total sales</p><p className="font-extrabold text-brand-red">{naira(Number(summary?.total_sales ?? 0))}</p></div>
        <div className="rounded-xl bg-brand-soft p-3"><p className="text-xs text-neutral-600">Paid orders</p><p className="font-extrabold text-brand-red">{summary?.paid_orders ?? 0}</p></div>
        <div className="rounded-xl bg-brand-soft p-3"><p className="text-xs text-neutral-600">Awaiting payment</p><p className="font-extrabold text-brand-red">{summary?.awaiting_payment ?? 0}</p></div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-1" role="tablist">
        {([['awaiting', 'Awaiting'], ['active', 'Active'], ['all', 'All']] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
            className={`rounded-lg py-2 text-sm font-bold ${filter === k ? 'bg-white text-brand-red shadow' : 'text-neutral-600'}`}>{label}</button>
        ))}
      </div>
      <button type="button" onClick={load} className="mt-3 text-sm font-bold text-brand-red underline">Refresh</button>

      {loading && <p className="mt-4 text-neutral-500">Loading...</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      {!loading && shown.length === 0 && <p className="mt-4 rounded-xl bg-brand-soft p-4 text-center text-neutral-600">No orders here.</p>}

      <div className="mt-4 space-y-4">
        {shown.map((o) => (
          <article key={o.id} className="space-y-3 rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{o.reference}</p>
                <p className="text-xs text-neutral-500">{when(o.created_at)} · {o.payment_method === 'bank_transfer' ? 'Bank transfer' : 'Paystack'}</p>
              </div>
              <p className="text-lg font-extrabold text-brand-red">{naira(o.total)}</p>
            </div>
            <div className="text-sm">
              <p className="font-bold">{o.customer_name}</p>
              <p>
                <a className="underline" href={`tel:${o.phone}`}>{o.phone}</a> ·{' '}
                <a className="font-bold text-green-700 underline" target="_blank" rel="noreferrer"
                  href={waLink(toWa(o.phone), `Hello ${o.customer_name}, this is Istom Foods about order ${o.reference}.`)}>WhatsApp</a>
              </p>
              <p>{o.university}, {o.address}</p>
              {o.instructions && <p className="text-neutral-600">Note: {o.instructions}</p>}
            </div>
            <ul className="space-y-1 text-sm">
              {o.order_items.map((i, idx) => (
                <li key={idx} className="flex justify-between"><span>{i.product_name} ({fmtKg(i.quantity_kg)})</span><span>{naira(i.line_total)}</span></li>
              ))}
            </ul>
            {o.status === 'pending_payment' && o.payment_method === 'bank_transfer' && (
              <button type="button" disabled={busyId === o.id} onClick={() => confirmPayment(o)} className="btn-red w-full">Confirm payment received</button>
            )}
            <select aria-label="Order status" className="input" value={o.status} disabled={busyId === o.id} onChange={(e) => setStatus(o, e.target.value)}>
              {Object.entries(statusLabel).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const { user, loading, signIn, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'orders' | 'board'>('orders')

  useEffect(() => {
    if (!user) { setIsAdmin(null); return }
    supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle().then(({ data }) => setIsAdmin(Boolean(data)))
  }, [user])

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    const msg = await signIn(email, password)
    setBusy(false)
    if (msg) setError(msg)
  }

  if (loading) return <p className="p-8 text-center text-neutral-500">Loading...</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        {user && <button type="button" onClick={signOut} className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold">Sign out</button>}
      </div>

      {!user && (
        <form onSubmit={login} className="mt-6 space-y-3">
          <p className="text-neutral-600">Admin sign in</p>
          <input className="input" type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <input className="input" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="btn-red w-full">{busy ? 'Please wait...' : 'Sign in'}</button>
        </form>
      )}

      {user && isAdmin === null && <p className="mt-6 text-neutral-500">Checking access...</p>}
      {user && isAdmin === false && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">This account is not an admin account.</p>}
      {user && isAdmin && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1" role="tablist">
            {([['orders', 'Orders'], ['board', 'Board']] as const).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`rounded-lg py-2 font-bold ${tab === k ? 'bg-white text-brand-red shadow' : 'text-neutral-600'}`}>{label}</button>
            ))}
          </div>
          {tab === 'orders' ? <Orders /> : <AdminBoard />}
        </div>
      )}
    </div>
  )
}
