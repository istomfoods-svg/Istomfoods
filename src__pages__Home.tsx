import { Link } from 'react-router-dom'
import CowCuts from '../components/CowCuts'
import CutoffNotice from '../components/CutoffNotice'
import ProductImage from '../components/ProductImage'
import Reveal from '../components/Reveal'
import { useSettings } from '../context/SettingsContext'
import { useProducts } from '../hooks'
import { naira, waLink } from '../lib/format'

const steps = [
  ['Choose your meat', 'Pick beef or assorted meat and how much you want.'],
  ['Place your order', 'Add to cart and enter your hostel or address.'],
  ['Pay securely online', 'Pay with card, bank transfer or USSD through Paystack.'],
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

export default function Home() {
  const { products, loading } = useProducts()
  const s = useSettings()
  const free = s.deliveryFee === 0

  const tickerItems = [
    'Fresh beef daily',
    ...(free ? ['Free delivery on every order'] : []),
    `Student Bites from ${naira(s.smallMin)}`,
    'Assorted orders close at 10am',
    'Book a day before',
  ]

  return (
    <>
      <section className="relative isolate flex min-h-[36rem] items-end overflow-hidden bg-[#1a0508] text-white md:min-h-[40rem] md:items-center">
        <img src="/hero.jpg" alt="" aria-hidden="true"
          className="hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-[50%_30%] md:left-auto md:right-0 md:w-[55%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a0508] via-[#1a0508]/55 to-black/20 md:bg-gradient-to-r md:from-[#1a0508] md:via-[#1a0508]/60 md:to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-24 md:py-32">
          <div className="rise flex flex-wrap items-center gap-3">
            {free && <p className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-bold backdrop-blur">Free delivery on every order</p>}
            <span className="sticker text-sm">⏰ Assorted orders close 10am</span>
          </div>
          <h1 className="rise mt-5 max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl" style={{ animationDelay: '120ms' }}>
            Fresh Meat, Delivered to Your Doorstep.
          </h1>
          <p className="rise mt-6 max-w-xl text-lg text-white/90 md:text-xl" style={{ animationDelay: '260ms' }}>
            Order fresh beef and assorted meat from Istom Foods. Convenient, affordable, and delivered to you.
          </p>
          <div className="rise mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '400ms' }}>
            <Link to="/shop" className="btn-red text-lg">Order Now 🔥</Link>
            <Link to="/student-bites" className="btn-outline">Student Bites from {naira(s.smallMin)}</Link>
          </div>
        </div>
      </section>

      <Ticker items={tickerItems} />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal><h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Featured meat</h2></Reveal>
        {loading ? <p className="mt-4 text-neutral-500">Loading products...</p> : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 120}>
                <Link to="/shop" className="card-lift block overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                  <div className="aspect-[4/3]"><ProductImage url={p.image_url} name={p.name} /></div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="font-bold text-brand-red">{naira(p.price_per_kg)} per kg</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-28">
        <div className="relative mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="text-center text-4xl font-extrabold tracking-tight md:text-6xl"><span className="grad-text">Know your beef.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-neutral-400">Every cut has its own job. Tap a piece to see what it is best for.</p>
          </Reveal>
          <div className="mt-12"><CowCuts /></div>
        </div>
      </section>

      <section className="bg-brand-soft py-16">
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

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="grad-text text-4xl font-extrabold tracking-tight md:text-5xl">Delivery for students</h2>
            <p className="mt-4 text-neutral-700">We deliver to hostels and addresses around EKSU and across {s.deliveryArea}. Give us your hostel and room details at checkout and we bring the meat to you.</p>
            <p className="mt-4 text-lg font-bold">{free ? 'Delivery is free on every order.' : `Delivery fee: ${naira(s.deliveryFee)} per order.`}</p>
            <div className="mt-4"><CutoffNotice /></div>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-3xl p-8 text-white" style={{ backgroundImage: 'linear-gradient(135deg,#B3121F,#FF5A3C)', boxShadow: '0 30px 60px -25px rgba(225,29,46,.7)' }}>
              <h3 className="text-3xl font-bold">Student Bites 🥩</h3>
              <p className="mt-2 text-white/90">Not ready for a full kilo? Buy assorted meat from {naira(s.smallMin)} and up.</p>
              <Link to="/student-bites" className="btn-white mt-5">Buy a small portion</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-neutral-900 py-14 text-center text-white">
        <Reveal>
          <h2 className="text-3xl font-bold">Questions? Chat with us.</h2>
          <a href={waLink(s.whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn mt-5 bg-green-600 text-white hover:bg-green-700">Chat on WhatsApp</a>
        </Reveal>
      </section>
    </>
  )
}
