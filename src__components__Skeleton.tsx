export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white" aria-hidden="true">
      <div className="shimmer aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="shimmer h-6 w-2/3 rounded-lg" />
        <div className="shimmer h-5 w-1/3 rounded-lg" />
        <div className="shimmer h-11 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ n = 2, cols = 'sm:grid-cols-2 lg:grid-cols-3' }: { n?: number; cols?: string }) {
  return (
    <div className={`mt-6 grid gap-5 ${cols}`} role="status" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  )
}
