import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { waLink } from '../lib/format'

const links: [string, string][] = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/student-bites', 'Student Bites'],
  ['/my-orders', 'My Orders'],
  ['/contact', 'Contact'],
]

function Logo() {
  // Shows /logo.png if it exists, otherwise falls back to the letter badge
  const [noImage, setNoImage] = useState(false)
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Istom Foods home">
      {noImage ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red font-display text-xl font-extrabold text-white">
          I<span className="text-brand-orange">F</span>
        </span>
      ) : (
        <img src="/logo.png" alt="Istom Foods logo" className="h-10 w-10 rounded-xl object-contain" onError={() => setNoImage(true)} />
      )}
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold text-brand-red">Istom Foods</span>
        <span className="block text-xs text-neutral-500">Feeding the Nation</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { count } = useCart()
  const { whatsapp } = useSettings()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 font-medium ${isActive ? 'bg-brand-soft text-brand-red' : 'text-neutral-700 hover:text-brand-red'}`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative rounded-xl bg-brand-soft px-4 py-2 font-bold text-brand-red" aria-label={`Cart, ${count} items`}>
              Cart
              {count > 0 && <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-xs text-white">{count}</span>}
            </Link>
            <button type="button" className="rounded-xl border border-neutral-300 px-3 py-2 font-bold md:hidden"
              onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">{open ? 'Close' : 'Menu'}</button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col border-t border-neutral-200 px-4 py-2 md:hidden">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-neutral-900 py-8 text-neutral-300">
        <div className="mx-auto max-w-6xl space-y-2 px-4 text-sm">
          <p className="font-display text-lg font-bold text-white">Istom Foods</p>
          <p>Feeding the Nation. Fresh beef and assorted meat, Ado-Ekiti, Ekiti State.</p>
          <p>© {new Date().getFullYear()} Istom Foods</p>
        </div>
      </footer>

      <a href={waLink(whatsapp, 'Hello Istom Foods, I need help with an order.')} target="_blank" rel="noreferrer"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-green-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-green-700">
        WhatsApp us
      </a>
    </div>
  )
}
