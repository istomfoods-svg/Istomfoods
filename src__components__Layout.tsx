import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { naira, waLink } from '../lib/format'
import { SantaHat, Snow } from './Christmas'

const links: [string, string][] = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/student-bites', 'Student Bites'],
  ['/account', 'My Orders'],
  ['/beef', 'Know your beef'],
  ['/board', 'Board'],
  ['/contact', 'Contact'],
]

// pages where the floating cart bar would just get in the way
const NO_BAR = ['/cart', '/checkout', '/transfer', '/account', '/admin', '/payment-complete', '/my-orders']

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const icons: Record<string, ReactNode> = {
  home: <Icon><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>,
  shop: <Icon><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></Icon>,
  bites: <Icon><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><path d="M7 7h.01" /></Icon>,
  cart: <Icon><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /></Icon>,
  user: <Icon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>,
}

const tabs: [string, string, string][] = [
  ['/', 'Home', 'home'],
  ['/shop', 'Shop', 'shop'],
  ['/student-bites', 'Bites', 'bites'],
  ['/cart', 'Cart', 'cart'],
  ['/account', 'Account', 'user'],
]

function Logo({ christmas }: { christmas: boolean }) {
  // Shows /logo.png if it exists, otherwise falls back to the letter badge
  const [noImage, setNoImage] = useState(false)
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Istom Foods home">
      {noImage ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red font-display text-xl font-extrabold text-white">
          I<span className="text-brand-orange">F</span>
        </span>
      ) : (
        <span className="relative">
          <img src="/logo.png" alt="Istom Foods logo" className="h-11 w-11 rounded-full bg-white object-cover" onError={() => setNoImage(true)} />
          {christmas && <SantaHat className="absolute -right-2 -top-3 h-6 w-7 rotate-12" />}
        </span>
      )}
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold text-brand-red">Istom Foods</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { count, subtotal } = useCart()
  const { whatsapp, christmas } = useSettings()
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(false)
  const prevTotal = useRef<number | null>(null)
  const { pathname } = useLocation()

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  // little celebration whenever something is added to the cart
  useEffect(() => {
    if (prevTotal.current !== null && subtotal > prevTotal.current) {
      setPulse(true)
      try { navigator.vibrate?.(15) } catch { /* not supported */ }
      const t = setTimeout(() => setPulse(false), 700)
      prevTotal.current = subtotal
      return () => clearTimeout(t)
    }
    prevTotal.current = subtotal
  }, [subtotal])

  const showBar = count > 0 && !NO_BAR.includes(pathname)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 font-medium ${isActive ? 'bg-brand-soft text-brand-red' : 'text-neutral-700 hover:text-brand-red'}`

  return (
    <div className="theme-meat flex min-h-screen flex-col">
      <div className="meat-bg" aria-hidden="true" />
      {christmas && <Snow />}

      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo christmas={christmas} />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={navClass}>{label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className={`relative hidden rounded-xl bg-brand-soft px-4 py-2 font-bold text-brand-red md:block ${pulse ? 'pop' : ''}`} aria-label={`Cart, ${count} items`}>
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

      <main className="flex-1"><div key={pathname} className="page-enter"><Outlet /></div></main>

      <footer className="bg-neutral-900 pb-28 pt-8 text-neutral-300 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-2 px-4 text-sm">
          <p className="font-display text-lg font-bold text-white">Istom Foods</p>
          <p>Feeding the Nation. Fresh beef and assorted meat, Ado-Ekiti, Ekiti State.</p>
          <p>© {new Date().getFullYear()} Istom Foods</p>
        </div>
      </footer>

      {showBar && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[4.9rem] z-40 flex justify-center px-3 md:bottom-4">
          <Link to="/checkout" className={`bar-in pointer-events-auto flex w-full max-w-md items-center justify-between rounded-2xl px-5 py-3 font-bold text-white ${pulse ? 'pop' : ''}`}
            style={{ backgroundImage: 'linear-gradient(135deg,#E11D2E,#FF5A3C)', boxShadow: '0 16px 36px -12px rgba(225,29,46,.85)' }}>
            <span>{count} item{count > 1 ? 's' : ''} · {naira(subtotal)}</span>
            <span>Checkout</span>
          </Link>
        </div>
      )}

      <a href={waLink(whatsapp, 'Hello Istom Foods, I need help with an order.')} target="_blank" rel="noreferrer"
        className={`fixed right-4 z-40 rounded-full bg-green-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-green-700 md:bottom-4 ${showBar ? 'bottom-[8.9rem]' : 'bottom-[5rem]'}`}>
        WhatsApp us
      </a>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#1a0508]/90 backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="grid grid-cols-5">
          {tabs.map(([to, label, icon]) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition ${isActive ? 'text-[#FF8A5C]' : 'text-white/60'}`}>
                <span className={`relative ${icon === 'cart' && pulse ? 'pop' : ''}`}>
                  {icons[icon]}
                  {icon === 'cart' && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] text-white">{count}</span>
                  )}
                </span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
