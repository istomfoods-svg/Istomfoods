import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/Skeleton'
import { useProducts } from '../hooks'

export default function Shop() {
  const { products, loading, error } = useProducts()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="mt-1 text-neutral-600">Pick your meat, tell us how many kilos, and we handle the rest.</p>
      {loading && <SkeletonGrid n={2} />}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="mt-6 text-neutral-500">No products available right now. Check back soon.</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
