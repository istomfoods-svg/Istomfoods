import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { naira, waLink } from '../lib/format'
import { supabase } from '../lib/supabase'

type State = 'checking' | 'success' | 'failed' | 'abandoned' | 'pending' | 'error'

export default function PaymentComplete() {
  const [params] = useSearchParams()
  const reference = (params.get('reference') ?? params.get('trxref') ?? '').toUpperCase()
  const { clear } = useCart()
  const { whatsapp } = useSettings()
  const { user } = useAuth()
  const [state, setState] = useState<State>('checking')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!reference) { setState('error'); return }
    let cancelled = false

    const check = async (attempt: number) => {
      // The server asks Paystack. This page never decides if a payment worked.
      const { data, error } = await supabase.functions.invoke('verify-payment', { body: { reference } })
      if (cancelled) return
      if (error || !data) { setState('error'); return }
      if (data.status === 'success') {
        setTotal(Number(data.total))
        clear()
        try { localStorage.setItem('istom-last-order', reference) } catch { /* ignore */ }
        setState('success')
        return
      }
      if (data.status === 'pending' && attempt < 5) { setTimeout(() => check(attempt + 1), 3000); return }
      setState(data.status === 'failed' ? 'failed' : data.status === 'abandoned' ? 'abandoned' : 'pending')
    }

    check(0)
    return () => { cancelled = true }
  }, [reference])

  const help = waLink(whatsapp, `Hello Istom Foods, my order ID is ${reference}.`)

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      {state === 'checking' && (
        <>
          <h1 className="text-3xl font-bold">Confirming your payment...</h1>
          <p className="mt-2 text-neutral-600">Please wait a few seconds. Do not close this page.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <h1 className="text-3xl font-bold text-green-700">Payment received</h1>
          <p className="mt-2 text-neutral-700">Thank you! We got {naira(total)} and we are preparing your order.</p>
          <div className="mt-6 rounded-2xl bg-brand-soft p-4">
            <p className="text-sm text-neutral-600">Your order ID</p>
            <p className="text-2xl font-extrabold text-brand-red">{reference}</p>
            <p className="mt-1 text-sm text-neutral-600">Save this ID. You need it to track your order.</p>
          </div>
          <a href={help} target="_blank" rel="noreferrer" className="btn mt-6 w-full bg-green-600 text-white hover:bg-green-700">Message us on WhatsApp with this order ID</a>
          <Link to={user ? '/account' : '/my-orders'} className="btn-outline mt-3 w-full">Track my order</Link>
        </>
      )}

      {state === 'failed' && (
        <>
          <h1 className="text-3xl font-bold text-red-700">Payment failed</h1>
          <p className="mt-2 text-neutral-700">Your payment did not go through, so you have not been charged for this order. Your cart is still saved.</p>
          <Link to="/checkout" className="btn-red mt-6 w-full">Try again</Link>
        </>
      )}

      {state === 'abandoned' && (
        <>
          <h1 className="text-3xl font-bold">Payment not completed</h1>
          <p className="mt-2 text-neutral-700">You left the payment page before paying. Your cart is still saved.</p>
          <Link to="/checkout" className="btn-red mt-6 w-full">Go back to checkout</Link>
        </>
      )}

      {(state === 'pending' || state === 'error') && (
        <>
          <h1 className="text-3xl font-bold">We could not confirm your payment yet</h1>
          <p className="mt-2 text-neutral-700">If money left your account, do not pay again. Message us with your order ID and we will check it.</p>
          {reference && <p className="mt-3 font-bold text-brand-red">{reference}</p>}
          <a href={help} target="_blank" rel="noreferrer" className="btn mt-6 w-full bg-green-600 text-white hover:bg-green-700">Message us on WhatsApp</a>
        </>
      )}
    </div>
  )
}
