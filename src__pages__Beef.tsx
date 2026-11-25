import CowViewer from '../components/CowViewer'

export default function Beef() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="sec-title text-3xl font-extrabold tracking-tight md:text-4xl">Know your beef</h1>
      <p className="mt-2 max-w-xl text-neutral-600">Every cut has its own job. Turn the cow, then tap a cut to see what it is best for.</p>
      <div className="theme-dark mt-6 rounded-3xl p-4 md:p-6" style={{ background: '#1A0508' }}><CowViewer /></div>
    </div>
  )
}
