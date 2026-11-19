import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { naira } from '../lib/format'
import type { Product } from '../types'
import CutoffNotice from './CutoffNotice'
import ProductImage from './ProductImage'

const PRESETS = [0.5, 1, 1.5, 2]

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
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
    <article className="card-lift overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="h-32 sm:h-40"><ProductImage url={product.image_url} name={product.name} /></div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="font-bold text-brand-red">{naira(product.price_per_kg)} <span className="text-xs font-medium text-neutral-500">per kg</span></p>
          </div>
          <p className="text-right"><span className="block text-xs text-neutral-500">Total</span><span className="text-lg font-extrabold">{valid ? naira(qty * product.price_per_kg) : '-'}</span></p>
        </div>
        {product.description && <p className="line-clamp-2 text-sm text-neutral-600">{product.description}</p>}

        <div className="flex flex-wrap gap-2" role="group" aria-label="How many kilograms">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => { setQty(p); setCustom(''); setShowCustom(false) }}
              className={`chip ${qty === p && !showCustom ? 'chip-on' : ''}`}>{p}kg</button>
          ))}
          <button type="button" onClick={() => setShowCustom((s) => !s)} className={`chip ${showCustom ? 'chip-on' : ''}`}>Custom</button>
        </div>
        {showCustom && (
          <div>
            <input type="number" inputMode="decimal" min="0.25" step="0.25" placeholder="Type kg, e.g. 3" value={custom}
              onChange={(e) => onCustom(e.target.value)} className="input" aria-label="Custom kilograms" />
            {!valid && <p className="mt-1 text-sm text-red-600">Enter between 0.25kg and 50kg.</p>}
          </div>
        )}

        <button type="button" onClick={addToCart} disabled={!valid} className="btn-red w-full">
          {added ? 'Added to cart ✓' : 'Add to cart'}
        </button>
        {added && <Link to="/cart" className="block text-center text-sm font-bold text-brand-red underline">View cart</Link>}
        {/assorted/i.test(product.name) && <CutoffNotice compact />}
      </div>
    </article>
  )
}
