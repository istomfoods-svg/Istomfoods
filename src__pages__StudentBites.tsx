import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useProducts } from '../hooks'
import { fmtKg, naira } from '../lib/format'
import type { Product } from '../types'

function BiteCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { smallMin, smallStep } = useSettings()
  const [amount, setAmount] = useState(smallMin)
  const [custom, setCustom] = useState('')
  const [added, setAdded] = useState(false)

  const chips = Array.from({ length: 6 }, (_, i) => smallMin + i * smallStep)
  const valid = amount >= smallMin && amount % smallStep === 0

  const onCustom = (v: string) => {
    setCustom(v)
    const n = parseInt(v, 10)
    setAmount(Number.isFinite(n) ? n : 0)
  }

  const addToCart = () => {
    if (!valid) return
    add({ productId: product.id, name: product.name, pricePerKg: product.price_per_kg, imageUrl: product.image_url, mode: 'amount', qty: amount })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-[16/9]"><ProductImage url={product.image_url} name={product.name} /></div>
      <div className="space-y-4 p-4">
        <h3 className="text-xl font-bold">{product.name}</h3>
        <div>
          <p className="mb-2 text-sm font-medium">How much do you want to spend?</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c} type="button" onClick={() => { setAmount(c); setCustom('') }}
                className={`chip ${amount === c && !custom ? 'chip-on' : ''}`}>{naira(c)}</button>
            ))}
          </div>
          <input type="number" inputMode="numeric" min={smallMin} step={smallStep} placeholder={`Or type an amount, e.g. ${smallMin + smallStep * 8}`}
            value={custom} onChange={(e) => onCustom(e.target.value)} className="input mt-3" aria-label="Custom amount in Naira" />
          {!valid && <p className="mt-1 text-sm text-red-600">Enter {naira(smallMin)} or more, in steps of {naira(smallStep)}.</p>}
        </div>
        <div className="rounded-xl bg-brand-soft p-3 text-center">
          <p className="text-sm text-neutral-600">You get about</p>
          <p className="text-2xl font-extrabold text-brand-red">{valid ? fmtKg(amount / product.price_per_kg) : '-'}</p>
        </div>
        <button type="button" onClick={addToCart} disabled={!valid} className="btn-red w-full">
          {added ? 'Added to cart' : `Add ${valid ? naira(amount) : ''} to cart`}
        </button>
        {added && <Link to="/cart" className="block text-center text-sm font-bold text-brand-red underline">View cart</Link>}
      </div>
    </article>
  )
}

export default function StudentBites() {
  const { products, loading, error } = useProducts()
  const { smallMin } = useSettings()
  const list = products.filter((p) => p.small_portion_enabled)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Student Bites</h1>
      <p className="mt-1 text-neutral-600">Small portions of assorted meat, starting from {naira(smallMin)}. Pick an amount and we work out the weight.</p>
      {loading && <p className="mt-6 text-neutral-500">Loading...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && list.length === 0 && <p className="mt-6 text-neutral-500">Small portions are not available right now.</p>}
      <div className="mt-6 grid gap-5">{list.map((p) => <BiteCard key={p.id} product={p} />)}</div>
      <p className="mt-6 text-sm text-neutral-500">The weight is an estimate based on today's price per kg. The delivery fee is added at checkout.</p>
    </div>
  )
}
