import { useState } from 'react'
import { Link } from 'react-router-dom'
import CutoffNotice from '../components/CutoffNotice'
import ProductImage from '../components/ProductImage'
import Reveal from '../components/Reveal'
import { SkeletonGrid } from '../components/Skeleton'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useAnnouncements, useProducts } from '../hooks'
import { naira, waLink } from '../lib/format'
import type { Product } from '../types'

const steps = [
  ['Choose your meat', 'Pick beef or assorted meat and how much you want.'],
  ['Place your order', 'Add to cart and enter your hostel or address.'],
  ['Pay your way', 'Send a bank transfer, or pay by card or USSD.'],
  ['Receive your delivery', 'We bring your meat to your door.'],
]

// A product row with Add to cart right on it, no need to open anything
function QuickCard({ p }: { p: Product }) {
  const { add } = useCart()
  const { smallMin } = useSettings()
  const [flash, setFlash] = useState<'kg' | 'bite' | null>(null)
  const pulse = (k: 'kg' | 'bite') => { setFlash(k); setTimeout(() => setFlash(null), 1500) }

  const addKg = () => {
    add({ productId: p.id, name: p.name, pricePerKg: p.price_per_kg, imageUrl: p.image_url, mode: 'weight', qty: 1 })
    pulse('kg')
  }
  const addBite = () => {
    add({ productId: p.id, name: p.name, pricePerKg: p.price_per_kg, imageUrl: p.image_url, mode: 'amount', qty: smallMin })
    pulse('bite')
  }

  return (
    <div className="card-lift flex gap-4 rounded-3xl border border-neutral-200 bg-white p-3">
      <Link to="/shop" className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32" aria-label={`See ${p.name} in the shop`}>
        <ProductImage url={p.image_url} name={p.name} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold">{p.name}</h3>
          <p className="font-bold text-brand-red">{naira(p.price_per_kg)} <span className="text-xs font-medium text-neutral-500">per kg</span></p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={addKg} className="btn-red px-4 py-2 text-sm">{flash === 'kg' ? 'Added ✓' : 'Add 1kg'}</button>
          {p.small_portion_enabled && <button type="button" onClick={addBite} className="btn-outline px-3 py-2 text-sm">{flash === 'bite' ? 'Added ✓' : `Add ${naira(smallMin)}`}</button>}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { products, loading } = useProducts()
  const { items: posts } = useAnnouncements(1)
  const s = useSettings()
  const free = s.deliveryFee === 0

  const more = [
    ['/beef', 'Know your beef', 'A simple guide to each cut and what it is best for.'],
    ['/board', 'Campus board', posts[0]?.title ?? 'Updates from Istom Foods.'],
    ['/contact', 'Contact', 'Questions about an order or delivery? Talk to us.'],
  ]

  return (
    <>
      {s.christmas && (
        <div className="py-2 text-center text-sm font-bold text-white" style={{ background: '#9E0B22' }}>
          🎄 Merry Christmas from Istom Foods. Order early for the holidays.
        </div>
      )}

      {/* Welcome */}
      <section className="relative isolate flex min-h-[22rem] items-end overflow-hidden bg-[#1a0508] text-white md:min-h-[28rem] md:items-center">
        <img src="/hero.jpg" alt="" aria-hidden="true"
          className="hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-[50%_30%] md:left-auto md:right-0 md:w-[55%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a0508] via-[#1a0508]/60 to-black/20 md:bg-gradient-to-r md:from-[#1a0508] md:via-[#1a0508]/60 md:to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-14 md:py-20">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Fresh Meat, Delivered to Your Doorstep.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">
            Order fresh beef and assorted meat from Istom Foods. Convenient, affordable, and delivered to you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className="btn-red text-lg">Order Now</Link>
            <Link to="/student-bites" className="btn-outline">Student Bites from {naira(s.smallMin)}</Link>
          </div>
          <p className="mt-3 text-sm text-white/70">Or tap the <b>Shop</b> icon any time to browse everything.</p>
        </div>
      </section>

      {/* Who we are */}
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Reveal>
          <img src="/logo.png" alt="Istom Foods logo" className="mx-auto h-24 w-24 rounded-full bg-white object-cover" />
          <p className="mt-3 font-display text-3xl font-extrabold">Istom Foods</p>
          <h2 className="mt-8 text-2xl font-extrabold tracking-tight md:text-3xl">Who we are</h2>
          <p className="mt-4 text-lg text-neutral-700">Istom Foods is a Nigerian meat supplier and food processor based in Ado-Ekiti, Ekiti State. We sell freshly processed, locally sourced beef and assorted meat, and we deliver to students and families around EKSU and across {s.deliveryArea}.</p>
          <p className="mt-4 text-neutral-700">We were started by a student, for students. Everyone deserves protein, so good meat should not be a luxury, whatever your budget.</p>
        </Reveal>
      </section>

      {/* Order */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Ready to order?</h2>
          <p className="mt-2 text-neutral-600">Add straight to your cart, or open the Shop for the full range.</p>
        </Reveal>
        {loading ? <SkeletonGrid n={2} cols="md:grid-cols-2" /> : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((p, i) => <Reveal key={p.id} delay={i * 80}><QuickCard p={p} /></Reveal>)}
          </div>
        )}
        <div className="mt-6"><Link to="/shop" className="btn-outline">Go to the Shop</Link></div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl border-t border-white/10 px-4 py-16">
        <Reveal><h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">How it works</h2></Reveal>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red font-bold text-white">{i + 1}</span>
              <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-neutral-600">{text}</p></div>
            </li>
          ))}
        </ol>
      </section>

      {/* Delivery and Student Bites */}
      <section className="mx-auto max-w-4xl border-t border-white/10 px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight">Delivery</h2>
            <p className="mt-3 text-neutral-700">Give us your hostel and room details at checkout and we bring the meat to you.</p>
            <p className="mt-3 font-bold">{free ? 'Delivery is free on every order.' : `Delivery fee: ${naira(s.deliveryFee)} per order.`}</p>
            <div className="mt-4"><CutoffNotice compact /></div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-2xl font-extrabold tracking-tight">Student Bites</h2>
            <p className="mt-3 text-neutral-700">Not ready for a full kilo? Buy assorted meat from {naira(s.smallMin)} and up. Pick an amount and we work out the weight.</p>
            <div className="mt-4"><Link to="/student-bites" className="btn-outline">Buy a small portion</Link></div>
          </Reveal>
        </div>
      </section>

      {/* More */}
      <section className="mx-auto max-w-4xl border-t border-white/10 px-4 py-16">
        <ul className="divide-y divide-white/10">
          {more.map(([to, title, text]) => (
            <li key={to}>
              <Link to={to} className="flex items-center justify-between gap-4 py-5">
                <span><span className="block text-lg font-bold">{title}</span><span className="block text-sm text-neutral-600">{text}</span></span>
                <span aria-hidden="true" className="text-2xl text-neutral-500">›</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <a href={waLink(s.whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn bg-green-600 text-white hover:bg-green-700">Chat on WhatsApp</a>
        </div>
      </section>
    </>
  )
}
