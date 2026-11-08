import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { fmtKg, naira, statusLabel, waLink } from '../lib/format'
import { supabase } from '../lib/supabase'

interface OrderRow {
  id: string; reference: string; status: string; total: number; created_at: string
  order_items: { product_name: string; quantity_kg: number; line_total: number }[]
}
interface PayRow {
  id: string; reference: string; amount: number; status: string
  channel: string | null; paid_at: string | null; created_at: string
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
const payLabel: Record<string, string> = { success: 'Paid', pending: 'Pending', failed: 'Failed' }
const payStyle: Record<string, string> = {
  success: 'bg-green-100 text-green-800', pending: 'bg-amber-100 text-amber-800', failed: 'bg-red-100 text-red-700',
}

const STEPS: [string, string][] = [
  ['paid', 'Paid'], ['processing', 'Preparing'], ['ready_for_delivery', 'Ready for delivery'], ['delivered', 'Delivered'],
]

function Tracker({ status }: { status: string }) {
  if (status === 'cancelled') return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">This order was cancelled.</p>
  if (status === 'pending_payment') {
    return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Waiting for payment. If you already paid, message us on WhatsApp with your order ID.</p>
  }
  const idx = STEPS.findIndex(([k]) => k === status)
  return (
    <ol className="flex items-start pt-1">
      {STEPS.map(([k, label], i) => (
        <li key={k} className="relative flex-1 text-center">
          {i > 0 && <span className={`absolute left-[-50%] right-[50%] top-4 h-1 ${i <= idx ? 'bg-brand-red' : 'bg-neutral-200'}`} />}
          <span className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= idx ? 'bg-brand-red text-white' : 'bg-neutral-200 text-neutral-500'}`}>
            {i < idx ? '✓' : i + 1}
          </span>
          <span className={`mt-1 block text-xs ${i <= idx ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}>{label}</span>
        </li>
      ))}
    </ol>
  )
}

function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup') {
      if (f.name.trim().length < 3) { setError('Enter your full name.'); return }
      if (!/^(\+?234|0)[789][01]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) { setError('Enter a valid Nigerian phone number.'); return }
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email)) { setError('Enter a valid email address.'); return }
    if (f.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setBusy(true)
    const msg = mode === 'signup' ? await signUp(f) : await signIn(f.email, f.password)
    setBusy(false)
    if (msg) setError(msg)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
      <p className="mt-1 text-neutral-600">Track your orders and see your payment history in one place.</p>
      <form onSubmit={submit} className="mt-6 space-y-3" noValidate>
        {mode === 'signup' && (
          <>
            <input className="input" placeholder="Full name" autoComplete="name" value={f.name} onChange={set('name')} aria-label="Full name" />
            <input className="input" type="tel" inputMode="tel" placeholder="Phone number, e.g. 08012345678" autoComplete="tel" value={f.phone} onChange={set('phone')} aria-label="Phone number" />
          </>
        )}
        <input className="input" type="email" placeholder="Email address" autoComplete="email" value={f.email} onChange={set('email')} aria-label="Email address" />
        <input className="input" type="password" placeholder="Password (6 or more characters)" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={f.password} onChange={set('password')} aria-label="Password" />
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-red w-full">{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button type="button" className="mt-4 text-sm font-bold text-brand-red underline" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>
      <p className="mt-6 text-sm text-neutral-600">No account? You can still <Link to="/my-orders" className="font-bold text-brand-red underline">track an order with its order ID</Link>.</p>
    </div>
  )
}

function Dashboard() {
  const { user, signOut } = useAuth()
  const { whatsapp } = useSettings()
  const [tab, setTab] = useState<'orders' | 'payments'>('orders')
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [pays, setPays] = useState<PayRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let off = false
    ;(async () => {
      const [o, p] = await Promise.all([
        supabase.from('orders').select('id,reference,status,total,created_at,order_items(product_name,quantity_kg,line_total)').order('created_at', { ascending: false }),
        supabase.from('payments').select('id,reference,amount,status,channel,paid_at,created_at').order('created_at', { ascending: false }),
      ])
      if (off) return
      if (o.error || p.error) setError('Could not load your orders. Please refresh the page.')
      else { setOrders((o.data ?? []) as OrderRow[]); setPays((p.data ?? []) as PayRow[]) }
      setLoading(false)
    })()
    return () => { off = true }
  }, [])

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there'

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hi, {name}</h1>
          <p className="text-sm text-neutral-600">{user?.email}</p>
        </div>
        <button type="button" onClick={signOut} className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold">Sign out</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1" role="tablist">
        {(['orders', 'payments'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-lg py-2 font-bold ${tab === t ? 'bg-white text-brand-red shadow' : 'text-neutral-600'}`}>
            {t === 'orders' ? 'Order tracker' : 'Transactions'}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-neutral-500">Loading...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}

      {!loading && !error && tab === 'orders' && (
        <div className="mt-6 space-y-4">
          {orders.length === 0 && (
            <div className="rounded-2xl bg-brand-soft p-6 text-center">
              <p className="font-bold">No orders yet</p>
              <p className="text-sm text-neutral-600">Orders you place while signed in show up here.</p>
              <Link to="/shop" className="btn-red mt-4">Go to shop</Link>
            </div>
          )}
          {orders.map((o) => (
            <article key={o.id} className="space-y-3 rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{o.reference}</p>
                  <p className="text-xs text-neutral-500">{date(o.created_at)}</p>
                </div>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-red">{statusLabel[o.status] ?? o.status}</span>
              </div>
              <Tracker status={o.status} />
              <ul className="space-y-1 text-sm">
                {o.order_items.map((i, idx) => (
                  <li key={idx} className="flex justify-between"><span>{i.product_name} ({fmtKg(i.quantity_kg)})</span><span>{naira(i.line_total)}</span></li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t pt-2">
                <a className="text-sm font-bold text-green-700 underline" target="_blank" rel="noreferrer"
                  href={waLink(whatsapp, `Hello Istom Foods, my order ID is ${o.reference}.`)}>Message us about this order</a>
                <p className="font-extrabold text-brand-red">{naira(o.total)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && tab === 'payments' && (
        <div className="mt-6 space-y-3">
          {pays.length === 0 && <p className="rounded-2xl bg-brand-soft p-6 text-center text-neutral-600">No transactions yet.</p>}
          {pays.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 p-4">
              <div>
                <p className="font-bold">{naira(p.amount)}</p>
                <p className="text-xs text-neutral-500">{p.reference} · {date(p.paid_at ?? p.created_at)}{p.channel ? ` · ${p.channel}` : ''}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${payStyle[p.status] ?? 'bg-neutral-100'}`}>{payLabel[p.status] ?? p.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Account() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-center text-neutral-500">Loading...</p>
  return <div className="mx-auto max-w-2xl px-4 py-8">{user ? <Dashboard /> : <AuthForm />}</div>
}
