import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { lineKg, lineTotal, useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { feeText, fmtKg, naira } from '../lib/format'

export default function Cart() {
  const { items, subtotal, setQty, remove } = useCart()
  const { deliveryFee, smallMin, smallStep } = useSettings()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-600">Pick some meat to get started.</p>
        <Link to="/shop" className="btn-red mt-6">Go to shop</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <ul className="mt-6 space-y-4">
        {items.map((i) => {
          const step = i.mode === 'amount' ? smallStep : 0.5
          const min = i.mode === 'amount' ? smallMin : 0.5
          return (
            <li key={i.key} className="flex gap-3 rounded-2xl border border-neutral-200 p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><ProductImage url={i.imageUrl} name={i.name} /></div>
              <div className="flex-1">
                <p className="font-bold">{i.name}{i.mode === 'amount' && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-red">Student Bites</span>}</p>
                <p className="text-sm text-neutral-600">{naira(i.pricePerKg)}/kg, {fmtKg(lineKg(i))}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" className="h-9 w-9 rounded-lg border border-neutral-300 text-lg font-bold disabled:opacity-40"
                    disabled={i.qty - step < min} onClick={() => setQty(i.key, +(i.qty - step).toFixed(2))} aria-label="Reduce">-</button>
                  <span className="min-w-[4.5rem] text-center font-bold">{i.mode === 'amount' ? naira(i.qty) : `${i.qty}kg`}</span>
                  <button type="button" className="h-9 w-9 rounded-lg border border-neutral-300 text-lg font-bold"
                    onClick={() => setQty(i.key, +(i.qty + step).toFixed(2))} aria-label="Increase">+</button>
                  <button type="button" className="ml-auto text-sm font-bold text-red-600 underline" onClick={() => remove(i.key)}>Remove</button>
                </div>
              </div>
              <p className="font-bold">{naira(lineTotal(i))}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 space-y-2 rounded-2xl bg-brand-soft p-4">
        <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{naira(subtotal)}</span></div>
        <div className="flex justify-between"><span>Delivery fee</span><span className="font-bold">{feeText(deliveryFee)}</span></div>
        <div className="flex justify-between border-t border-brand-orange/40 pt-2 text-lg"><span className="font-bold">Total</span><span className="font-extrabold text-brand-red">{naira(subtotal + deliveryFee)}</span></div>
      </div>
      <Link to="/checkout" className="btn-red mt-4 w-full text-lg">Go to checkout</Link>
    </div>
  )
}
