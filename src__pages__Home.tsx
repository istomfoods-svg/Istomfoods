import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useSettings } from '../context/SettingsContext'
import { useProducts } from '../hooks'
import { naira, waLink } from '../lib/format'

const steps = [
  ['Choose your meat', 'Pick beef or assorted meat and how much you want.'],
  ['Place your order', 'Add to cart and enter your hostel or address.'],
  ['Pay securely online', 'Pay with card, bank transfer or USSD through Paystack.'],
  ['Receive your delivery', 'We bring your meat to your door.'],
]

export default function Home() {
  const { products, loading } = useProducts()
  const s = useSettings()

  return (
    <>
      <section className="bg-gradient-to-br from-brand-red via-brand-red to-brand-orange text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-24">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">Fresh Meat, Delivered to Your Doorstep.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">Order fresh beef and assorted meat from Istom Foods. Convenient, affordable, and delivered to you.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className="btn-white text-lg">Order Now</Link>
            <Link to="/student-bites" className="btn border-2 border-white text-white hover:bg-white/10">Student Bites from {naira(s.smallMin)}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-bold">Featured meat</h2>
        {loading ? <p className="mt-4 text-neutral-500">Loading products...</p> : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <Link key={p.id} to="/shop" className="overflow-hidden rounded-2xl border border-neutral-200">
                <div className="aspect-[4/3]"><ProductImage url={p.image_url} name={p.name} /></div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="font-bold text-brand-red">{naira(p.price_per_kg)} per kg</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-brand-soft py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title} className="rounded-2xl bg-white p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Delivery for students</h2>
            <p className="mt-3 text-neutral-700">We deliver to hostels and addresses around EKSU and across {s.deliveryArea}. Give us your hostel and room details at checkout and we bring the meat to you.</p>
            <p className="mt-3 font-bold">Delivery fee: {naira(s.deliveryFee)} per order.</p>
          </div>
          <div className="rounded-2xl bg-brand-red p-6 text-white">
            <h3 className="text-2xl font-bold">Student Bites</h3>
            <p className="mt-2 text-white/90">Not ready for a full kilo? Buy assorted meat from {naira(s.smallMin)} and up.</p>
            <Link to="/student-bites" className="btn-white mt-4">Buy a small portion</Link>
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">Questions? Chat with us.</h2>
        <a href={waLink(s.whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn mt-4 bg-green-600 text-white hover:bg-green-700">Chat on WhatsApp</a>
      </section>
    </>
  )
}
