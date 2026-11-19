const PHOTOS = ['/beef.jpg', '/hero.jpg', '/assorted.jpg', '/bg-meat.jpg']

export default function PhotoStrip() {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {PHOTOS.map((src, i) => (
        <div key={src} className={`card-lift aspect-[4/3] w-44 shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 md:w-auto ${i % 2 ? 'md:translate-y-4 md:rotate-2' : 'md:-rotate-2'}`}>
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  )
}
