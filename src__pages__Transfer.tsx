import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { naira, waLink } from '../lib/format'

interface Saved { reference: string; total: number; bank: { name: string; number: string; accountName: string } }

export default function Transfer() {
  const { whatsapp } = useSettings()
  const [saved] = useState<Saved | null>(() => {
    try { return JSON.parse(localStorage.getItem('istom-transfer') ?? 'null') as Saved | null } catch { return null }
  })
  const [copied, setCopied] = useState('')

  if (!saved) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">No transfer order found</h1>
        <p className="mt-2 text-neutral-600">If you placed an order, find it under My Orders.</p>
        <Link to="/account" className="btn-red mt-6">My Orders</Link>
      </div>
    )
  }

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500) } catch { /* ignore */ }
  }

  const row = (label: string, value: string, copyable = true) => (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 py-3 last:border-0">
      <div><p className="text-xs text-neutral-500">{label}</p><p className="text-lg font-bold">{value}</p></div>
      {copyable && <button type="button" onClick={() => copy(label, value)} className="rounded-lg border border-neutral-300 px-3 py-1 text-sm font-bold">{copied === label ? 'Copied' : 'Copy'}</button>}
    </div>
  )

  const message = `Hello Istom Foods, I have paid ${naira(saved.total)} by transfer for order ${saved.reference}.`

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">Order placed. Now send the money.</h1>
      <p className="mt-2 text-neutral-700">Your order starts as soon as we confirm your transfer.</p>

      <div className="mt-6 rounded-2xl bg-brand-soft p-4">
        <p className="text-sm text-neutral-600">Send exactly</p>
        <p className="text-4xl font-extrabold text-brand-red">{naira(saved.total)}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 px-4">
        {row('Bank', saved.bank.name, false)}
        {row('Account number', saved.bank.number)}
        {row('Account name', saved.bank.accountName, false)}
        {row('Order ID (put this in the transfer remark)', saved.reference)}
      </div>

      <ol className="mt-6 list-decimal space-y-2 pl-5 text-neutral-700">
        <li>Open your bank app and send the exact amount above.</li>
        <li>Put your order ID in the remark or narration.</li>
        <li>Tap the button below and send us your receipt on WhatsApp.</li>
      </ol>

      <a href={waLink(whatsapp, message)} target="_blank" rel="noreferrer" className="btn mt-6 w-full bg-green-600 text-lg text-white hover:bg-green-700">I have paid. Send receipt on WhatsApp</a>
      <Link to="/my-orders" className="btn-outline mt-3 w-full">Track my order</Link>
      <p className="mt-4 text-sm text-neutral-500">Save your order ID. It stays pending until we see your money, and unpaid orders may be cancelled.</p>
    </div>
  )
}
