import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { waLink } from '../lib/format'
import CowCuts from './CowCuts'

// 60 pre-rendered angles packed into sheets: /cow/hide-0..4.jpg, /cow/cuts-0..4.jpg and /cow/ids.png
const N = 60, PER = 12, COLS = 4, FW = 512, FH = 384
const IW = 256, IH = 192, ICOLS = 10
const SHEETS = N / PER

const CUTS = [
  { id: 1, name: 'Chuck', color: '#CC122A', desc: 'Neck and shoulder. Rich, beefy flavour that suits stews, soups and slow cooking.' },
  { id: 2, name: 'Rib', color: '#F23329', desc: 'Tender and well marbled. Good for grilling, roasting and rich stews.' },
  { id: 3, name: 'Loin', color: '#FF6133', desc: 'Taken from along the back. The most tender part, best for quick grilling and frying.' },
  { id: 4, name: 'Round', color: '#FF8C38', desc: 'The hind leg and rump. Lean meat that slices well for roasts, stir-fries and stews.' },
  { id: 5, name: 'Brisket', color: '#800F24', desc: 'The chest. Full of flavour, and best cooked slowly until soft, in stews and pots.' },
  { id: 6, name: 'Plate & Flank', color: '#F57566', desc: 'The belly area. Strong flavour that works sliced thin and grilled, or simmered in stews.' },
  { id: 7, name: 'Shank', color: '#FAB36B', desc: 'The lower legs. Perfect for pepper soup and broth, where bones and tendons add body.' },
]

type Mode = 'cow' | 'cuts'
type Sheets = { hide: (HTMLImageElement | null)[]; cuts: (HTMLImageElement | null)[]; ids: HTMLImageElement | null }

const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const im = new Image(); im.decoding = 'async'
  im.onload = () => resolve(im); im.onerror = () => reject(new Error(src)); im.src = src
})

export default function CowViewer() {
  const { whatsapp } = useSettings()
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sheets = useRef<Sheets>({ hide: Array(SHEETS).fill(null), cuts: Array(SHEETS).fill(null), ids: null })
  const idCache = useRef(new Map<number, Uint8ClampedArray>())
  const overlays = useRef(new Map<string, HTMLCanvasElement>())
  const idCtx = useRef<CanvasRenderingContext2D | null>(null)
  const st = useRef({ target: 0, current: 0, vel: 0, drag: false, lastX: 0, moved: 0, lastInput: 0, inView: false, dirty: true, mode: 'cow' as Mode, selected: 0 })
  const [mode, setMode] = useState<Mode>('cow')
  const [selected, setSelected] = useState(0)
  const [ready, setReady] = useState(false)
  const [cutsReady, setCutsReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => { st.current.mode = mode; st.current.selected = selected; st.current.dirty = true }, [mode, selected])

  // load the realistic frames when the section comes near the screen
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let started = false
    const start = () => {
      if (started) return
      started = true
      for (let i = 0; i < SHEETS; i++) {
        load(`/cow/hide-${i}.jpg`)
          .then((im) => { sheets.current.hide[i] = im; st.current.dirty = true; if (i === 0) setReady(true) })
          .catch(() => { if (i === 0) setFailed(true) })
      }
    }
    if (typeof IntersectionObserver === 'undefined') { st.current.inView = true; start(); return }
    const io = new IntersectionObserver(([e]) => { st.current.inView = e.isIntersecting; if (e.isIntersecting) start() }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // the cuts frames only load if you ask for them
  useEffect(() => {
    if (mode !== 'cuts' || cutsReady) return
    let alive = true
    Promise.all([load('/cow/ids.png'), ...Array.from({ length: SHEETS }, (_, i) => load(`/cow/cuts-${i}.jpg`))])
      .then(([ids, ...cs]) => {
        if (!alive) return
        sheets.current.ids = ids; cs.forEach((im, i) => { sheets.current.cuts[i] = im }); setCutsReady(true); st.current.dirty = true
      })
      .catch(() => { if (alive) setMode('cow') })
    return () => { alive = false }
  }, [mode, cutsReady])

  const idsFor = (frame: number) => {
    const cached = idCache.current.get(frame)
    if (cached) return cached
    const img = sheets.current.ids
    if (!img) return null
    if (!idCtx.current) {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      const x = c.getContext('2d', { willReadFrequently: true })
      if (!x) return null
      x.drawImage(img, 0, 0); idCtx.current = x
    }
    const data = idCtx.current.getImageData((frame % ICOLS) * IW, Math.floor(frame / ICOLS) * IH, IW, IH).data
    const arr = new Uint8ClampedArray(IW * IH)
    for (let k = 0; k < arr.length; k++) arr[k] = Math.round(data[k * 4] / 32)
    idCache.current.set(frame, arr)
    return arr
  }

  const overlay = (frame: number, sel: number) => {
    const key = `${frame}-${sel}`
    const hit = overlays.current.get(key)
    if (hit) return hit
    const arr = idsFor(frame)
    if (!arr) return null
    const c = document.createElement('canvas'); c.width = IW; c.height = IH
    const x = c.getContext('2d')
    if (!x) return null
    const im = x.createImageData(IW, IH)
    for (let k = 0; k < arr.length; k++) if (arr[k] === sel) { im.data[k * 4] = 255; im.data[k * 4 + 1] = 255; im.data[k * 4 + 2] = 255; im.data[k * 4 + 3] = 90 }
    x.putImageData(im, 0, 0)
    if (overlays.current.size > 240) overlays.current.clear()
    overlays.current.set(key, c)
    return c
  }

  const draw = useCallback(() => {
    const cv = canvas.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const s = st.current
    const a = ((s.current % 360) + 360) % 360
    const f = (a / 360) * N
    const i0 = Math.floor(f) % N, i1 = (i0 + 1) % N, frac = f - Math.floor(f)
    const useCuts = s.mode === 'cuts' && !!sheets.current.cuts[0]
    const pick = (i: number) => {
      const set = useCuts ? sheets.current.cuts : sheets.current.hide
      const sh = set[Math.floor(i / PER)], k = i % PER
      return sh ? { sh, sx: (k % COLS) * FW, sy: Math.floor(k / COLS) * FH } : null
    }
    const A = pick(i0), B = pick(i1)
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    ctx.globalAlpha = 1
    if (A) ctx.drawImage(A.sh, A.sx, A.sy, FW, FH, 0, 0, cv.width, cv.height)
    else if (B) ctx.drawImage(B.sh, B.sx, B.sy, FW, FH, 0, 0, cv.width, cv.height)
    if (A && B && frac > 0.02) { ctx.globalAlpha = frac; ctx.drawImage(B.sh, B.sx, B.sy, FW, FH, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1 }
    if (useCuts && s.selected) {
      const ov = overlay(frac < 0.5 ? i0 : i1, s.selected)
      if (ov) ctx.drawImage(ov, 0, 0, cv.width, cv.height)
    }
    s.dirty = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // smooth animation loop: eases toward the target angle, with momentum and a slow idle spin
  useEffect(() => {
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const s = st.current
      if (!s.inView) { last = now; return }
      const dt = Math.min(3, Math.max(0.5, (now - last) / 16.667)); last = now
      if (!s.drag) {
        if (Math.abs(s.vel) > 0.01) { s.target += s.vel * dt; s.vel *= Math.pow(0.94, dt) }
        else { s.vel = 0; if (!reduced && now - s.lastInput > 2200) s.target += 0.11 * dt }
      }
      const k = 1 - Math.exp(-0.16 * dt)
      const before = s.current
      s.current += (s.target - s.current) * k
      if (s.dirty || Math.abs(s.current - before) > 0.0005) draw()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [draw, reduced])

  // scrolling the page turns the cow too
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY, d = y - lastY; lastY = y
      const s = st.current
      if (s.inView && !reduced) { s.target += d * 0.28; s.lastInput = performance.now() }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  // keep the drawing sharp on any screen
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const fit = () => {
      const w = Math.min(1024, Math.round(cv.clientWidth * Math.min(2, window.devicePixelRatio || 1)))
      if (w && cv.width !== w) { cv.width = w; cv.height = Math.round((w * FH) / FW); st.current.dirty = true }
    }
    fit()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(cv)
    window.addEventListener('resize', fit)
    return () => { ro?.disconnect(); window.removeEventListener('resize', fit) }
  }, [ready, failed])

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = st.current
    s.drag = true; s.lastX = e.clientX; s.moved = 0; s.vel = 0; s.lastInput = performance.now()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not supported */ }
  }
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = st.current
    if (!s.drag) return
    const dx = e.clientX - s.lastX; s.lastX = e.clientX; s.moved += Math.abs(dx)
    const d = dx * 0.45
    s.target += d; s.vel = d * 0.6 + s.vel * 0.4; s.lastInput = performance.now()
  }
  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = st.current
    s.drag = false
    if (s.moved < 6 && s.mode === 'cuts') {
      const cv = e.currentTarget, r = cv.getBoundingClientRect()
      const px = Math.floor(((e.clientX - r.left) / r.width) * IW), py = Math.floor(((e.clientY - r.top) / r.height) * IH)
      const a = ((s.current % 360) + 360) % 360
      const arr = idsFor(Math.round((a / 360) * N) % N)
      const id = arr && px >= 0 && px < IW && py >= 0 && py < IH ? arr[py * IW + px] : 0
      if (id > 0) setSelected(id)
    }
  }
  const onKey = (e: ReactKeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === 'ArrowLeft') { st.current.target -= 6; st.current.lastInput = performance.now(); e.preventDefault() }
    if (e.key === 'ArrowRight') { st.current.target += 6; st.current.lastInput = performance.now(); e.preventDefault() }
  }

  if (failed) return <CowCuts />

  const current = CUTS.find((c) => c.id === selected)

  return (
    <div ref={wrap}>
      <div className="mx-auto mb-4 grid w-full max-w-xs grid-cols-2 gap-1 rounded-full bg-white/10 p-1" role="tablist" aria-label="Cow view">
        {(['cow', 'cuts'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`rounded-full py-2 text-sm font-bold transition duration-300 ${mode === m ? 'bg-brand-red text-white' : 'text-neutral-600'}`}>
            {m === 'cow' ? 'Cow' : 'Cuts'}
          </button>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        {!ready && <div className="shimmer absolute inset-0 rounded-3xl" aria-hidden="true" />}
        <canvas ref={canvas} width={768} height={576} tabIndex={0} role="img"
          aria-label="3D cow. Drag sideways or scroll to turn it. Use the arrow keys to rotate."
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { st.current.drag = false }} onKeyDown={onKey}
          className="block w-full cursor-grab select-none rounded-3xl active:cursor-grabbing"
          style={{ touchAction: 'pan-y', aspectRatio: '4 / 3' }} />
        {mode === 'cuts' && !cutsReady && <p className="absolute inset-x-0 bottom-3 text-center text-xs text-neutral-500">Loading the cuts...</p>}
      </div>
      <p className="mt-2 text-center text-xs text-neutral-500">Drag to turn the cow. Scroll the page to spin it too.</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {CUTS.map((c) => (
          <button key={c.id} type="button" onClick={() => { setMode('cuts'); setSelected(c.id) }}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition duration-300 ${selected === c.id && mode === 'cuts' ? 'border-white/60 bg-white/15' : 'border-white/15 hover:border-white/40'}`}>
            <span className="h-3 w-3 rounded-full" style={{ background: c.color }} aria-hidden="true" />{c.name}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center" aria-live="polite">
        {current && mode === 'cuts' ? (
          <>
            <h3 className="text-2xl font-bold">{current.name}</h3>
            <p className="mt-2 text-neutral-700">{current.desc}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Link to="/shop" className="btn-red">Order fresh beef</Link>
              <a href={waLink(whatsapp, `Hello Istom Foods, can I get ${current.name}?`)} target="_blank" rel="noreferrer" className="btn-outline">Ask for this cut</a>
            </div>
          </>
        ) : (
          <p className="text-neutral-600">{mode === 'cuts' ? 'Tap a colour on the cow, or a name above, to see what it is best for.' : 'Switch to Cuts to see where each cut comes from.'}</p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-500">A general guide to beef cuts. Availability varies, so ask us on WhatsApp for a specific cut.</p>
    </div>
  )
}
