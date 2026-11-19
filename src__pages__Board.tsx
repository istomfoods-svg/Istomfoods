import Reveal from '../components/Reveal'
import { SkeletonGrid } from '../components/Skeleton'
import { useAnnouncements } from '../hooks'

export const postDate = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Board() {
  const { items, loading } = useAnnouncements()
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="grad-text text-4xl font-extrabold tracking-tight">Campus board</h1>
      <p className="mt-1 text-neutral-600">Updates from Istom Foods: deliveries, holiday dates and offers.</p>
      {loading && <SkeletonGrid n={2} cols="grid-cols-1" />}
      {!loading && items.length === 0 && <p className="mt-6 rounded-2xl bg-brand-soft p-6 text-center text-neutral-600">No updates yet. Check back soon.</p>}
      <div className="mt-6 space-y-4">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 80}>
            <article className="rounded-3xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                {a.pinned ? <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-red">📌 Pinned</span> : <span />}
                <span className="text-xs text-neutral-500">{postDate(a.created_at)}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold">{a.title}</h2>
              <p className="mt-2 whitespace-pre-line text-neutral-700">{a.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
