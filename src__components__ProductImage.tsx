import { useState } from 'react'

// Beef and Assorted Meat use /beef.jpg and /assorted.jpg when those pictures exist.
const localFor = (name: string) => (/assorted/i.test(name) ? '/assorted.jpg' : /beef/i.test(name) ? '/beef.jpg' : null)

export default function ProductImage({ url, name }: { url: string | null; name: string }) {
  const [broken, setBroken] = useState(false)
  const src = url ?? localFor(name)
  if (src && !broken) {
    return <img src={src} alt={name} loading="lazy" className="h-full w-full object-cover" onError={() => setBroken(true)} />
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-red to-brand-orange text-6xl" aria-label={name}>
      🥩
    </div>
  )
}
