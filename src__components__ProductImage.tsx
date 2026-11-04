export default function ProductImage({ url, name }: { url: string | null; name: string }) {
  if (url) return <img src={url} alt={name} loading="lazy" className="h-full w-full object-cover" />
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-red to-brand-orange text-6xl" aria-label={name}>
      🥩
    </div>
  )
}
