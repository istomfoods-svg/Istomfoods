import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const COLORS = ['#F12A37', '#FF5E37', '#FF9330', '#FFC27A', '#FFFFFF']

export default function Confetti() {
  const [on, setOn] = useState(true)
  const pieces = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    left: Math.random() * 100,
    dx: (Math.random() - 0.5) * 240,
    delay: Math.random() * 0.6,
    dur: 2.4 + Math.random() * 1.6,
    color: COLORS[i % COLORS.length],
  })), [])

  useEffect(() => {
    const t = setTimeout(() => setOn(false), 4800)
    return () => clearTimeout(t)
  }, [])

  if (!on || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return null
  return (
    <div aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} className="confetti" style={{
          left: `${p.left}%`, backgroundColor: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          ['--dx' as string]: `${p.dx}px`,
        } as CSSProperties} />
      ))}
    </div>
  )
}
