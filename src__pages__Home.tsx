import { useState } from 'react'
import { Link } from 'react-router-dom'
import CutoffNotice from '../components/CutoffNotice'
import Mascot from '../components/Mascot'
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

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

// Choose the weight (or amount), then add: the "+" on a product opens this
function AddSheet({ p, onClose }: { p: Product; onClose: () => void }) {
  const { add } = useCart()
  const { smallMin, smallStep } = useSettings()
  const [mode, setMode] = useState<'weight' | 'amount'>('weight')
  const [kg, setKg] = useState(1)
  const [amt, setAmt] = useState(smallMin)
  const total = mode === 'weight' ? kg * p.price_per_kg : amt
  const submit = () => {
    add({ productId: p.id, name: p.name, pricePerKg: p.price_per_kg, imageUrl: p.image_url, mode, qty: mode === 'weight' ? kg : amt })
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={onClose} role="presentation">
      <div className="sheet w-full max-w-md rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Add ${p.name}`}>
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-xl font-extrabold">{p.name}</h3><p className="font-bold text-brand-red">{naira(p.price_per_kg)} <span className="text-xs font-medium text-neutral-500">per kg</span></p></div>
          <button type="button" onClick={onClose} className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold" aria-label="Close">Close</button>
        </div>
        {p.small_portion_enabled && (
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1" role="tablist">
            {([['weight', 'By weight'], ['amount', 'By amount']] as const).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
                className={`rounded-full py-2 text-sm font-bold ${mode === k ? 'bg-white text-brand-red shadow' : 'text-neutral-600'}`}>{label}</button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {mode === 'weight'
            ? [0.5, 1, 1.5, 2].map((k) => <button key={k} type="button" onClick={() => setKg(k)} className={`chip ${kg === k ? 'chip-on' : ''}`}>{k}kg</button>)
            : Array.from({ length: 6 }, (_, i) => smallMin + i * smallStep).map((a) => <button key={a} type="button" onClick={() => setAmt(a)} className={`chip ${amt === a ? 'chip-on' : ''}`}>{naira(a)}</button>)}
        </div>
        <div className="mt-4 flex items-center justify-between"><span className="text-sm text-neutral-600">Total</span><span className="text-2xl font-extrabold">{naira(total)}</span></div>
        <button type="button" onClick={submit} className="btn-red mt-3 w-full">Add to cart</button>
      </div>
    </div>
  )
}

export default function Home() {
  const { products, loading } = useProducts()
  const { items: posts } = useAnnouncements(1)
  const s = useSettings()
  const free = s.deliveryFee === 0
  const [sheet, setSheet] = useState<Product | null>(null)

  const more = [
    ['/board', 'Campus board', posts[0]?.title ?? 'Updates from Istom Foods.'],
    ['/contact', 'Contact', 'Questions about an order or delivery? Talk to us.'],
  ]

  return (
    <>
      {/* 1. Hero: wide band, picture on the right */}
      <section className="hero2">
        <div className="hero2-grid">
          <div className="hero2-text">
            <h1>Campus Hunger? <em>We’ve Got You Covered.</em></h1>
            <p>Fresh beef, affordable bites and convenient ordering.</p>
            <div className="hero2-btns">
              <Link to="/shop" className="btn-red">Order Now</Link>
              <Link to="/student-bites" className="btn-outline">Student Bites</Link>
            </div>
            <p className="hero2-hint">Or tap the Shop icon to browse everything.</p>
          </div>
          <div className="hero2-art">
            <div className="hero2-photo" role="img" aria-label="Fresh cuts of beef" />
            <Mascot className="hero2-mascot" />
            <span className="hero2-tag">Fresh &amp; local</span>
          </div>
        </div>
      </section>

      <div className="trust">
        <div><Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Svg>Fresh &amp; locally sourced</div>
        <div><Svg><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></Svg>{free ? 'Free delivery' : 'Delivered to you'}</div>
        <div><Svg><path d="M2 5h20v14H2z" /><path d="M2 10h20" /></Svg>Transfer, card or USSD</div>
        <div><Svg><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Svg>Track your order</div>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* 2. Know your beef banner */}
        <Link to="/beef" className="kyb">
          <div><h2>KNOW YOUR <b>BEEF</b></h2><p>Turn the cow and discover what is behind every cut.</p><span className="btn-red">Explore Now</span></div>
          <div className="kyb-art"><img src="/cow-banner.jpg" alt="" loading="lazy" /></div>
        </Link>

        {/* 3. Student Bites and the product row */}
        <section className="pt-12">
          <Reveal>
            <div className="bites-head">
              <div><h2 className="text-3xl font-extrabold uppercase tracking-tight">Student Bites</h2><p className="text-neutral-600">Good food. Smart spending.</p></div>
              <div className="promo"><small>From</small>{naira(s.smallMin)}</div>
            </div>
          </Reveal>
          {loading ? <SkeletonGrid n={2} cols="grid-cols-2" /> : (
            <div className="rail mt-4">
              {products.map((p) => (
                <div key={p.id} className="railcard">
                  <div className="railimg"><ProductImage url={p.image_url} name={p.name} /><span className="railbadge">{p.small_portion_enabled ? 'Student Bites' : 'Fresh'}</span></div>
                  <div className="railinfo">
                    <div><p className="railname">{p.name}</p><p className="railprice">{naira(p.price_per_kg)}<small> /kg</small></p></div>
                    <button type="button" className="plus" aria-label={`Add ${p.name}`} onClick={() => setSheet(p)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3"><Link to="/shop" className="btn-outline">Open the Shop</Link><Link to="/student-bites" className="font-bold text-brand-red underline">See all Student Bites</Link></div>
          <div className="mt-5"><CutoffNotice compact /></div>
        </section>

        {/* 4. How it works */}
        <section className="border-t border-neutral-200 py-14 mt-12">
          <Reveal><h2 className="sec-title text-2xl font-extrabold tracking-tight md:text-3xl">How it works</h2></Reveal>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {steps.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ backgroundImage: 'linear-gradient(135deg,#F0670F,#D9480F)' }}>{i + 1}</span>
                <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-neutral-600">{text}</p></div>
              </li>
            ))}
          </ol>
          <p className="mt-6 font-bold">{free ? 'Delivery is free on every order.' : `Delivery fee: ${naira(s.deliveryFee)} per order.`}</p>
        </section>

        {/* 5. More */}
        <section className="border-t border-neutral-200 py-12">
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
          <div className="mt-8 text-center"><a href={waLink(s.whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn bg-green-600 text-white hover:bg-green-700">Chat on WhatsApp</a></div>
        </section>

        {/* 6. About, last: logo only */}
        <section id="about" className="mx-auto max-w-2xl border-t border-neutral-200 py-14 text-center">
          <Reveal>
            <img src="/logo.png" alt="Istom Foods logo" className="mx-auto h-28 w-28 rounded-full bg-white object-cover" />
            <h2 className="sec-title sec-center mt-8 text-2xl font-extrabold tracking-tight md:text-3xl">Who we are</h2>
            <p className="mt-4 text-lg text-neutral-700">Istom Foods is a Nigerian meat supplier and food processor based in Ado-Ekiti, Ekiti State. We sell freshly processed, locally sourced beef and assorted meat, and we deliver to students and families around EKSU and across {s.deliveryArea}.</p>
            <p className="mt-4 text-neutral-700">We were started by a student, for students. Everyone deserves protein, so good meat should not be a luxury, whatever your budget.</p>
          </Reveal>
        </section>
      </div>

      {sheet && <AddSheet p={sheet} onClose={() => setSheet(null)} />}
    </>
  )
}
