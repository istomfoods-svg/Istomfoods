import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { waLink } from '../lib/format'
import { useInView } from './Reveal'

interface Cut {
  id: string; name: string; desc: string
  paths: string[]; labels: { x: number; y: number }[]
  dx: number; dy: number
}

const CUTS: Cut[] = [
  { id: 'chuck', name: 'Chuck', dx: -60, dy: -30,
    desc: 'Neck and shoulder. Rich, beefy flavour that suits stews, soups and slow cooking.',
    paths: ['M200 135 Q262 105 335 118 L345 235 L225 255 Q192 215 200 135 Z'], labels: [{ x: 272, y: 190 }] },
  { id: 'rib', name: 'Rib', dx: 0, dy: -60,
    desc: 'Tender and well marbled. Good for grilling, roasting and rich stews.',
    paths: ['M350 118 Q420 106 484 120 L486 236 L355 238 Z'], labels: [{ x: 420, y: 182 }] },
  { id: 'loin', name: 'Loin', dx: 40, dy: -50,
    desc: 'Taken from along the back. The most tender part, best for quick grilling and frying.',
    paths: ['M494 120 Q545 110 584 126 L590 236 L496 237 Z'], labels: [{ x: 542, y: 184 }] },
  { id: 'round', name: 'Round', dx: 70, dy: -20,
    desc: 'The hind leg and rump. Lean meat that slices well for roasts, stir-fries and stews.',
    paths: ['M598 130 Q668 124 696 188 Q702 248 652 264 L600 240 Z'], labels: [{ x: 646, y: 200 }] },
  { id: 'brisket', name: 'Brisket', dx: -60, dy: 40,
    desc: 'The chest. Full of flavour, and best cooked slowly until soft, in stews and pots.',
    paths: ['M228 266 L348 248 L354 332 Q300 352 252 338 Z'], labels: [{ x: 292, y: 303 }] },
  { id: 'flank', name: 'Plate & Flank', dx: 0, dy: 60,
    desc: 'The belly area. Strong flavour that works sliced thin and grilled, or simmered in stews.',
    paths: ['M362 248 L586 244 L578 322 Q472 348 366 332 Z'], labels: [{ x: 472, y: 294 }] },
  { id: 'shank', name: 'Shank', dx: 0, dy: 70,
    desc: 'The lower legs. Perfect for pepper soup and broth, where bones and tendons add body.',
    paths: ['M262 348 L318 345 L312 428 L270 428 Z', 'M620 274 L664 272 L657 428 L627 428 Z'],
    labels: [{ x: 291, y: 452 }, { x: 642, y: 452 }] },
]

export default function CowCuts() {
  const [ref, seen] = useInView<HTMLDivElement>(0.25)
  const [sel, setSel] = useState<string | null>(null)
  const { whatsapp } = useSettings()
  const current = CUTS.find((c) => c.id === sel)

  return (
    <div ref={ref}>
      <svg viewBox="0 0 800 480" className="cowsvg mx-auto w-full max-w-4xl" role="group" aria-label="Beef cuts diagram">
        {/* head and tail, decorative */}
        <g style={{ opacity: seen ? 1 : 0, transition: 'opacity 1.2s ease' }}>
          <g className="floaty" style={{ animationDelay: '-2s' }}>
            <path d="M692 152 Q744 176 738 262" stroke="#71717a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="738" cy="270" r="11" fill="#52525b" />
            <path d="M168 124 Q172 94 190 86 Q184 108 186 130 Z" fill="#e5e5e5" />
            <path d="M198 142 Q150 118 108 148 Q66 184 76 236 Q88 266 132 264 Q180 258 208 232 Z" fill="#52525b" />
            <path d="M150 130 Q120 102 96 120 Q110 142 140 144 Z" fill="#52525b" />
            <ellipse cx="94" cy="234" rx="23" ry="16" fill="#71717a" />
            <circle cx="122" cy="180" r="6.5" fill="#fff" />
            <circle cx="120" cy="181" r="3" fill="#18181b" />
          </g>
        </g>

        {CUTS.map((c, i) => (
          <g key={c.id} style={{
            transform: seen ? 'translate(0px, 0px)' : `translate(${c.dx}px, ${c.dy}px)`,
            opacity: seen ? 1 : 0,
            transition: `transform 1.3s cubic-bezier(.16,1,.3,1) ${i * 90}ms, opacity 1s ease ${i * 90}ms`,
          }}>
            <g className="floaty" style={{ animationDelay: `${-i * 0.9}s` }}>
              <g className={`cut ${sel === c.id ? 'on' : ''}`} role="button" tabIndex={0} aria-label={c.name}
                onClick={() => setSel(c.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(c.id) } }}>
                {c.paths.map((d) => <path key={d} d={d} />)}
                {c.labels.map((l) => (
                  <text key={`${l.x}-${l.y}`} x={l.x} y={l.y} textAnchor="middle" fill="#fff" fontSize="19" fontWeight="700"
                    style={{ pointerEvents: 'none', fontFamily: 'Bricolage Grotesque, system-ui, sans-serif' }}>{c.name}</text>
                ))}
              </g>
            </g>
          </g>
        ))}
      </svg>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CUTS.map((c) => (
          <button key={c.id} type="button" onClick={() => setSel(c.id)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${sel === c.id ? 'border-brand-orange bg-brand-orange text-white' : 'border-white/20 text-neutral-300 hover:border-white/50'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur" aria-live="polite">
        {current ? (
          <>
            <h3 className="text-2xl font-bold">{current.name}</h3>
            <p className="mt-2 text-neutral-300">{current.desc}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <Link to="/shop" className="btn-red">Order fresh beef</Link>
              <a href={waLink(whatsapp, `Hello Istom Foods, can I get ${current.name}?`)} target="_blank" rel="noreferrer"
                className="btn border-2 border-white/30 text-white hover:bg-white/10">Ask for this cut</a>
            </div>
          </>
        ) : (
          <p className="text-neutral-400">Tap any piece to see what it is best for.</p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-500">A general guide to beef cuts. Availability varies, so ask us on WhatsApp for a specific cut.</p>
    </div>
  )
}
