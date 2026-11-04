import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { naira } from '../lib/format'
import type { Product } from '../types'
import ProductImage from './ProductImage'

const PRESETS = [0.5, 1, 1.5, 2]

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [custom, setCustom] = useState('')
  const [added, setAdded] = useState(false)

  const valid = qty >= 0.25 && qty <= 50
  const onCustom = (v: string) => {
    setCustom(v)
    const n = parseFloat(v)
    setQty(Number.isFinite(n) ? n : 0)
  }

  const addToCart = () => {
    if (!valid) return
    add({ productId: product.id, name: product.name, pricePerKg: product.price_per_kg, imageUrl: product.image_url, mode: 'weight', qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-[4/3]"><ProductImage url={product.image_url} name={product.name} /></div>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-lg font-bold text-brand-red">{naira(product.price_per_kg)} <span className="text-sm font-medium text-neutral-500">per kg</span></p>
          {product.description && <p className="mt-1 text-sm text-neutral-600">{product.description}</p>}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">How many kg?</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => { setQty(p); setCustom('') }}
                className={`chip ${qty === p && !custom ? 'chip-on' : ''}`}>{p}kg</button>
            ))}
          </div>
          <input type="number" inputMode="decimal" min="0.25" step="0.25" placeholder="Or type your own kg, e.g. 3"
            value={custom} onChange={(e) => onCustom(e.target.value)} className="input mt-3" aria-label="Custom kilograms" />
          {!valid && <p className="mt-1 text-sm text-red-600">Enter between 0.25kg and 50kg.</p>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Total</span>
          <span className="text-lg font-bold">{valid ? naira(qty * product.price_per_kg) : '-'}</span>
        </div>

        <button type="button" onClick={addToCart} disabled={!valid} className="btn-red w-full">
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
        {added && <Link to="/cart" className="block text-center text-sm font-bold text-brand-red underline">View cart</Link>}
      </div>
    </article>
  )
}
