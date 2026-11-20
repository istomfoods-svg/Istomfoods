import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import CowCuts from '../components/CowCuts'
import CutoffNotice from '../components/CutoffNotice'
import { SantaSteak, Steak } from '../components/MeatArt'
import PhotoStrip from '../components/PhotoStrip'
import ProductImage from '../components/ProductImage'
import Reveal from '../components/Reveal'
import { SkeletonGrid } from '../components/Skeleton'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useAnnouncements, useProducts } from '../hooks'
import { naira, waLink } from '../lib/format'
import type { Product } from '../types'
import { postDate } from './Board'

const steps = [
  ['Choose your meat', 'Pick beef or assorted meat and how much you want.'],
  ['Place your order', 'Add to cart and enter your hostel or address.'],
  ['Pay your way', 'Send a bank transfer, or pay by card or USSD.'],
  ['Receive your delivery', 'We bring your meat to your door.'],
]

function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden border-y border-white/10 py-3" style={{ background: 'linear-gradient(90deg,#9E0B22,#E11D2E,#FF5A3C)' }} aria-hidden="true">
      <div className="ticker flex w-max whitespace-nowrap font-display text-lg font-bold uppercase tracking-wide text-white">
        {row.map((t, i) => <span key={i} className="pr-10">{t} <span className="pl-10">✦</span></span>)}
      </div>
    </div>
  )
}

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
  const { items: posts } = useAnnouncements(3)
  const s = useSettings()
  const free = s.deliveryFee === 0
  const xmas = s.christmas

  const tickerItems = [
    ...(xmas ? ['Merry Christmas from Istom Foods'] : []),
    'Fresh beef daily',
    ...(free ? ['Free delivery on every order'] : []),
    `Student Bites from ${naira(s.smallMin)}`,
    'Assorted orders close at 10am',
    'Book a day before',
  ]

  const features = [
    { icon: '🥩', title: 'Fresh beef', text: 'Freshly processed and locally sourced, sold by the kilo.' },
    { icon: '🍲', title: 'Assorted meat', text: 'A mix of quality cuts, great for soups and stews.' },
    { icon: '🎓', title: 'Made for students', text: `Student Bites start from ${naira(s.smallMin)}.` },
    { icon: '🚚', title: free ? 'Free delivery' : 'We deliver', text: `To hostels and addresses around EKSU and across ${s.deliveryArea}.` },
  ]

  return (
    <>
      {xmas && (
        <div className="py-2 text-center text-sm font-bold text-white" style={{ background: 'linear-gradient(90deg,#9E0B22,#E11D2E,#9E0B22)' }}>
          🎄 Merry Christmas from Istom Foods. Order early for the holidays. 🥩
        </div>
      )}

      {/* 1. Welcome */}
      <section className="relative isolate flex min-h-[24rem] items-end overflow-hidden bg-[#1a0508] text-white md:min-h-[30rem] md:items-center">
        <img src="/hero.jpg" alt="" aria-hidden="true"
          className="hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-[50%_30%] md:left-auto md:right-0 md:w-[55%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a0508] via-[#1a0508]/55 to-black/20 md:bg-gradient-to-r md:from-[#1a0508] md:via-[#1a0508]/60 md:to-transparent" />
        <div className="sway pointer-events-none absolute right-3 top-3 w-20 md:right-[8%] md:top-10 md:w-32" style={{ ['--r' as string]: '10deg' } as CSSProperties} aria-hidden="true">
          {xmas ? <SantaSteak className="block h-auto w-full" /> : <Steak className="block h-auto w-full" />}
        </div>
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-14 md:py-20">
          <div className="rise flex flex-wrap items-center gap-2">
            {free && <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">Free delivery on every order</p>}
            <span className="sticker text-xs">⏰ Assorted orders close 10am</span>
            {xmas && <span className="sticker text-xs">🎄 Merry Christmas</span>}
          </div>
          <h1 className="rise mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl" style={{ animationDelay: '120ms' }}>
            Fresh Meat, Delivered to Your Doorstep.
          </h1>
          <p className="rise mt-4 max-w-xl text-base text-white/90 md:text-lg" style={{ animationDelay: '260ms' }}>
            Order fresh beef and assorted meat from Istom Foods. Convenient, affordable, and delivered to you.
          </p>
          <div className="rise mt-6 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '400ms' }}>
            <Link to="/shop" className="btn-red text-lg">Order Now 🔥</Link>
            <a href="#about" className="btn-outline">About Istom Foods</a>
          </div>
          <p className="rise mt-3 text-sm text-white/70" style={{ animationDelay: '520ms' }}>Or tap the <b>Shop</b> icon any time to browse everything.</p>
        </div>
      </section>

      <Ticker items={tickerItems} />

      {/* 2. About: who we are and what we do */}
      <section id="about" className="scroll-mt-20 bg-brand-soft py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-5 md:items-center">
            <Reveal className="md:col-span-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="" aria-hidden="true" className="h-16 w-16 rounded-full bg-white object-cover" />
                <div><p className="font-display text-2xl font-extrabold">Istom Foods</p><p className="text-sm font-bold" style={{ color: '#FF8A3D' }}>Feeding the Nation</p></div>
              </div>
              <h2 className="grad-text mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">Who we are</h2>
              <p className="mt-4 text-lg text-neutral-700">Istom Foods is a Nigerian meat supplier and food processor based in Ado-Ekiti, Ekiti State. We sell freshly processed, locally sourced beef and assorted meat, and we deliver to students and families around EKSU and across {s.deliveryArea}.</p>
              <p className="mt-3 text-neutral-700">We were started by a student, for students. Everyone deserves protein, so good meat should not be a luxury, whatever your budget.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/shop" className="btn-red">Order Now 🔥</Link>
                <Link to="/contact" className="btn-outline">Contact us</Link>
              </div>
            </Reveal>
            <Reveal delay={120} className="md:col-span-2">
              <div className="grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f.title} className="card-lift rounded-3xl border border-neutral-200 bg-white p-4">
                    <div className="text-3xl" aria-hidden="true">{f.icon}</div>
                    <h3 className="mt-2 font-bold">{f.title}</h3>
                    <p className="mt-1 text-xs text-neutral-600">{f.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <Reveal><h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Fresh on the plate</h2></Reveal>
        <div className="mt-4"><PhotoStrip /></div>
      </section>

      {/* 3. Ready to order */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Ready to order?</h2>
          <p className="mt-2 text-neutral-600">Add straight to your cart from here, or tap Shop for the full range.</p>
        </Reveal>
        {loading ? <SkeletonGrid n={2} cols="md:grid-cols-2" /> : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((p, i) => <Reveal key={p.id} delay={i * 100}><QuickCard p={p} /></Reveal>)}
          </div>
        )}
        <div className="mt-6 text-center"><Link to="/shop" className="btn-red">Go to the Shop</Link></div>
      </section>

      {/* 4. How it works */}
      <section className="bg-brand-soft py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal><h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">How it works</h2></Reveal>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title}>
                <Reveal delay={i * 120}>
                  <div className="card-lift h-full rounded-3xl border border-neutral-200 bg-white p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white" style={{ backgroundImage: 'linear-gradient(135deg,#E11D2E,#FF5A3C)' }}>{i + 1}</span>
                    <h3 className="mt-4 text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Delivery and Student Bites */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Delivery for students</h2>
            <p className="mt-4 text-neutral-700">Give us your hostel and room details at checkout and we bring the meat to you.</p>
            <p className="mt-4 text-lg font-bold">{free ? 'Delivery is free on every order.' : `Delivery fee: ${naira(s.deliveryFee)} per order.`}</p>
            <div className="mt-4"><CutoffNotice /></div>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-3xl p-8 text-white" style={{ backgroundImage: 'linear-gradient(135deg,#9E0B22,#FF5A3C)', boxShadow: '0 30px 60px -25px rgba(225,29,46,.7)' }}>
              <h3 className="text-3xl font-bold">Student Bites 🥩</h3>
              <p className="mt-2 text-white/90">Not ready for a full kilo? Buy assorted meat from {naira(s.smallMin)} and up.</p>
              <Link to="/student-bites" className="btn-white mt-5">Buy a small portion</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Know your beef */}
      <section className="relative overflow-hidden bg-neutral-950 py-16 text-white md:py-24">
        <div className="relative mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="text-center text-4xl font-extrabold tracking-tight md:text-6xl"><span className="grad-text">Know your beef.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-neutral-400">Every cut has its own job. Tap a piece to see what it is best for.</p>
          </Reveal>
          <div className="mt-10"><CowCuts /></div>
        </div>
      </section>

      {/* 7. Campus board */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <Reveal><h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Campus board</h2></Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {posts.map((a, i) => (
              <Reveal key={a.id} delay={i * 100}>
                <Link to="/board" className="card-lift block h-full rounded-3xl border border-neutral-200 bg-white p-5">
                  <p className="text-xs text-neutral-500">{a.pinned ? '📌 ' : ''}{postDate(a.created_at)}</p>
                  <h3 className="mt-1 text-lg font-bold">{a.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-neutral-700">{a.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-4 text-center"><Link to="/board" className="font-bold text-brand-red underline">See all updates</Link></div>
        </section>
      )}

      {/* 8. Contact */}
      <section className="bg-neutral-900 py-12 text-center text-white">
        <Reveal>
          <h2 className="text-3xl font-bold">Questions? Chat with us.</h2>
          <a href={waLink(s.whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn mt-5 bg-green-600 text-white hover:bg-green-700">Chat on WhatsApp</a>
        </Reveal>
      </section>
    </>
  )
}
