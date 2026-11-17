import { useEffect, useRef, useState } from 'react'

// Smoothly counts from the old number to the new one
export default function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value); from.current = value; return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 600)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = a + (value - a) * eased
      setShown(v)
      from.current = v
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <>{format(shown)}</>
}
