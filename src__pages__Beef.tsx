import CowViewer from '../components/CowViewer'

export default function Beef() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="sec-title text-4xl font-extrabold tracking-tight">Know your beef</h1>
      <p className="mt-2 max-w-xl text-neutral-600">Every cut has its own job. Turn the cow, then tap a cut to see what it is best for.</p>
      <div className="mt-8"><CowViewer /></div>
    </div>
  )
}
