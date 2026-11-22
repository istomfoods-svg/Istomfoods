import type { CSSProperties } from 'react'

const STEAK = 'M16 46C8 26 34 10 58 14c26 4 36 30 24 52C70 88 36 92 22 76c-8-9 0-18-6-30z'

export const Steak = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <path d={STEAK} fill="#C8102E" />
    <path d={STEAK} fill="none" stroke="#FFD9C9" strokeWidth="5" strokeLinejoin="round" />
    <path d="M34 34c10-6 22-2 26 8M30 56c12 6 24 2 32-8M48 70c8 0 16-4 20-10" stroke="#F7A8A0" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
)

export const SantaSteak = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 112" className={className} aria-hidden="true">
    <g transform="translate(0,12)">
      <path d={STEAK} fill="#C8102E" />
      <path d={STEAK} fill="none" stroke="#FFD9C9" strokeWidth="5" strokeLinejoin="round" />
      <path d="M34 34c10-6 22-2 26 8M30 56c12 6 24 2 32-8M48 70c8 0 16-4 20-10" stroke="#F7A8A0" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
    <path d="M20 32C22 10 44 0 68 4c-6 6-8 14-6 24z" fill="#F12A37" />
    <rect x="14" y="26" width="52" height="11" rx="5.5" fill="#fff" />
    <circle cx="70" cy="6" r="6.5" fill="#fff" />
  </svg>
)

export const TBone = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <path d="M10 30C18 10 70 8 90 28c8 22-10 58-42 62C20 90 4 60 10 30z" fill="#C8102E" />
    <path d="M10 30C18 10 70 8 90 28c8 22-10 58-42 62C20 90 4 60 10 30z" fill="none" stroke="#FFD9C9" strokeWidth="5" />
    <path d="M50 18v66M28 48h44" stroke="#FFF4EC" strokeWidth="8" strokeLinecap="round" />
    <path d="M26 30c8-4 14 0 18 6M66 62c-6 4-14 2-18-4" stroke="#F7A8A0" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
)

export const Cubes = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <rect x="8" y="46" width="42" height="42" rx="9" fill="#C8102E" transform="rotate(-10 29 67)" />
    <rect x="46" y="38" width="44" height="44" rx="9" fill="#D81E34" transform="rotate(12 68 60)" />
    <rect x="26" y="8" width="42" height="42" rx="9" fill="#B30E28" transform="rotate(-4 47 29)" />
    <path d="M16 56l12-4M54 48l14-3M34 18l14-3" stroke="#F7A8A0" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const CowFace = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <path d="M24 28C14 14 8 20 6 8c14 0 22 6 26 16zM76 28C86 14 92 20 94 8c-14 0-22 6-26 16z" fill="#F5E6D3" />
    <ellipse cx="16" cy="44" rx="13" ry="7" transform="rotate(-25 16 44)" fill="#8B4A2B" />
    <ellipse cx="84" cy="44" rx="13" ry="7" transform="rotate(25 84 44)" fill="#8B4A2B" />
    <ellipse cx="50" cy="52" rx="28" ry="32" fill="#9B5532" />
    <ellipse cx="50" cy="74" rx="18" ry="13" fill="#F2C9B5" />
    <circle cx="43" cy="74" r="2.6" fill="#7a3b25" /><circle cx="57" cy="74" r="2.6" fill="#7a3b25" />
    <circle cx="38" cy="46" r="4.5" fill="#fff" /><circle cx="62" cy="46" r="4.5" fill="#fff" />
    <circle cx="39" cy="47" r="2.3" fill="#1a0508" /><circle cx="61" cy="47" r="2.3" fill="#1a0508" />
  </svg>
)

type Spot = { C: (p: { className?: string }) => JSX.Element; left: string; top: string; size: number; r: number; dur: number }
const SPOTS: Spot[] = [
  { C: Steak, left: '3%', top: '10%', size: 90, r: -20, dur: 11 },
  { C: TBone, left: '80%', top: '6%', size: 96, r: 14, dur: 13 },
  { C: Cubes, left: '68%', top: '34%', size: 70, r: 8, dur: 10 },
  { C: CowFace, left: '6%', top: '40%', size: 80, r: -8, dur: 12 },
  { C: Steak, left: '84%', top: '58%', size: 72, r: 24, dur: 14 },
  { C: TBone, left: '12%', top: '72%', size: 90, r: 10, dur: 11 },
  { C: Cubes, left: '50%', top: '84%', size: 70, r: -14, dur: 13 },
  { C: CowFace, left: '76%', top: '82%', size: 74, r: 12, dur: 12 },
  { C: Steak, left: '42%', top: '20%', size: 52, r: 30, dur: 15 },
]

// Soft meat drawings layered behind the whole site
export function MeatDecor({ christmas }: { christmas: boolean }) {
  return (
    <div aria-hidden="true">
      {SPOTS.map(({ C, left, top, size, r, dur }, i) => {
        const Art = christmas && i === 0 ? SantaSteak : C
        return (
          <div key={i} className="decor sway" style={{ left, top, width: size, opacity: 0.26, animationDuration: `${dur}s`, animationDelay: `${-i * 1.3}s`, ['--r' as string]: `${r}deg` } as CSSProperties}>
            <Art className="block h-auto w-full" />
          </div>
        )
      })}
    </div>
  )
}
