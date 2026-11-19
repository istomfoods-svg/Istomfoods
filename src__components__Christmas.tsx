import { useMemo, type CSSProperties } from 'react'

const BULBS = ['#ff3b3b', '#ffd23f', '#3bd16f', '#4da3ff']

export function Snow() {
  const flakes = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const r = (n: number) => { const x = Math.sin(i * 97.13 + n * 12.7) * 10000; return x - Math.floor(x) }
    return { left: r(1) * 100, size: 3 + r(2) * 5, dur: 9 + r(3) * 9, delay: -r(4) * 18, drift: (r(5) - 0.5) * 80, op: 0.45 + r(6) * 0.4 }
  }), [])
  return (
    <div className="snow" aria-hidden="true">
      {flakes.map((f, i) => (
        <span key={i} style={{ left: `${f.left}%`, width: f.size, height: f.size, opacity: f.op, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`, ['--dx' as string]: `${f.drift}px` } as CSSProperties} />
      ))}
    </div>
  )
}

export function Lights() {
  return (
    <ul className="lights" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <li key={i} style={{ background: BULBS[i % 4], color: BULBS[i % 4], animationDelay: `${(i % 6) * 0.25}s` }} />
      ))}
    </ul>
  )
}

export function SantaHat({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <path d="M6 38C10 14 30 4 52 6c-6 6-8 14-6 26z" fill="#D8122A" />
      <rect x="2" y="32" width="50" height="12" rx="6" fill="#fff" />
      <circle cx="54" cy="8" r="6" fill="#fff" />
    </svg>
  )
}
