import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { lineKg, lineTotal, useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { fmtKg, naira } from '../lib/format'
import { supabase } from '../lib/supabase'

interface Form {
  name: string; phone: string; email: string
  university: string; address: string; instructions: string
}
type Errors = Partial<Record<keyof Form, string>>

const phoneOk = (p: string) => /^(\+?234|0)[789][01]\d{8}$/.test(p.replace(/[\s-]/g, ''))

export default function Checkout() {
  const { items, subtotal } = useCart()
  const { deliveryFee, whatsapp } = useSettings()
  const [f, setF] = useState<Form>({ name: '', phone: '', email: '', university: 'EKSU, Ado-Ekiti', address: '', instructions: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Nothing to check out</h1>
        <Link to="/shop" className="btn-red mt-6">Go to shop</Link>
      </div>
    )
  }

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }))

  const validate = (): Errors => {
    const e: Errors = {}
    if (f.name.trim().length < 3) e.name = 'Enter your full name.'
    if (!phoneOk(f.phone)) e.phone = 'Enter a valid Nigerian phone number, e.g. 08012345678.'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email or leave it empty.'
    if (!f.university.trim()) e.university = 'Enter your university or location.'
    if (f.address.trim().length < 5) e.address = 'Enter your hostel or delivery address.'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    setServerError('')
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    // The server recalculates all prices. Nothing here decides what the customer pays.
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        customer: { name: f.name.trim(), phone: f.phone.replace(/[\s-]/g, ''), email: f.email.trim() || null,
          university: f.university.trim(), address: f.address.trim(), instructions: f.instructions.trim() || null },
        items: items.map((i) => ({ productId: i.productId, mode: i.mode, qty: i.qty })),
      },
    })
    setBusy(false)

    if (error || !data?.authorization_url) {
      setServerError('We could not start your payment. Please try again, or message us on WhatsApp.')
      return
    }
    try { localStorage.setItem('istom-last-order', data.reference) } catch { /* ignore */ }
    window.location.href = data.authorization_url as string
  }

  const field = (k: keyof Form, label: string, props: Record<string, string> = {}) => (
    <div>
      <label htmlFor={k} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={k} value={f[k]} onChange={set(k)} className="input" {...props} />
      {errors[k] && <p className="mt-1 text-sm text-red-600">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-5">
      <form onSubmit={submit} className="space-y-4 md:col-span-3" noValidate>
        <h1 className="text-3xl font-bold">Checkout</h1>
        {field('name', 'Full name', { autoComplete: 'name' })}
        {field('phone', 'Phone number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '08012345678' })}
        {field('email', 'Email address (optional)', { type: 'email', autoComplete: 'email' })}
        {field('university', 'University or location')}
        {field('address', 'Hostel or delivery address', { placeholder: 'e.g. Hostel name, block and room number' })}
        <div>
          <label htmlFor="instructions" className="mb-1 block text-sm font-medium">Delivery instructions (optional)</label>
          <textarea id="instructions" rows={3} value={f.instructions} onChange={set('instructions')} className="input" />
        </div>
        <div className="rounded-xl bg-brand-soft p-3 text-sm">
          <p className="font-bold">Payment method</p>
          <p>Pay online with Paystack: card, bank transfer or USSD. You will be taken to a secure Paystack page.</p>
        </div>
        {serverError && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">
            {serverError} <a className="font-bold underline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Open WhatsApp</a>
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-red w-full text-lg">
          {busy ? 'Starting payment...' : `Pay ${naira(subtotal + deliveryFee)}`}
        </button>
      </form>

      <aside className="md:col-span-2">
        <div className="sticky top-24 space-y-3 rounded-2xl border border-neutral-200 p-4">
          <h2 className="text-xl font-bold">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-2">
                <span>{i.name} ({fmtKg(lineKg(i))})</span><span className="font-bold">{naira(lineTotal(i))}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t pt-3">
            <div className="flex justify-between"><span>Subtotal</span><span>{naira(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>{naira(deliveryFee)}</span></div>
            <div className="flex justify-between text-lg font-extrabold text-brand-red"><span>Total</span><span>{naira(subtotal + deliveryFee)}</span></div>
          </div>
        </div>
      </aside>
    </div>
  )
}
