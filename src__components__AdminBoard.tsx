import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import type { Announcement } from '../types'

const when = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })

export default function AdminBoard() {
  const { christmas } = useSettings()
  const [xmas, setXmas] = useState(christmas)
  const [items, setItems] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { setXmas(christmas) }, [christmas])

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false })
    if (error) setMsg('Could not load the board. Did you run istom_board.sql?')
    else setItems((data ?? []) as Announcement[])
  }, [])
  useEffect(() => { load() }, [load])

  const post = async (e: FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 3) { setMsg('Add a title.'); return }
    setBusy(true); setMsg('')
    const { error } = await supabase.from('announcements').insert({ title: title.trim(), body: body.trim(), pinned })
    setBusy(false)
    if (error) { setMsg('Could not post that update.'); return }
    setTitle(''); setBody(''); setPinned(false); setMsg('Posted ✓')
    load()
  }

  const change = async (id: string, patch: Partial<Announcement>) => {
    const { error } = await supabase.from('announcements').update(patch).eq('id', id)
    if (error) setMsg('Could not update that post.')
    load()
  }
  const remove = async (a: Announcement) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return
    const { error } = await supabase.from('announcements').delete().eq('id', a.id)
    if (error) setMsg('Could not delete that post.')
    load()
  }

  const toggleXmas = async () => {
    const next = !xmas
    const { error } = await supabase.from('settings').upsert({ key: 'christmas_mode', value: next ? 'on' : 'off' }, { onConflict: 'key' })
    if (error) { setMsg('Could not change Christmas mode.'); return }
    setXmas(next); setMsg(`Christmas mode is ${next ? 'ON' : 'OFF'}. Refresh the site to see it.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div><p className="font-bold">Christmas mode</p><p className="text-sm text-neutral-600">Snow, lights and Santa hats on the site.</p></div>
        <button type="button" onClick={toggleXmas} className={xmas ? 'btn-red' : 'btn-outline'}>{xmas ? 'ON' : 'OFF'}</button>
      </div>

      <form onSubmit={post} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="font-bold">Post an update</p>
        <input className="input" placeholder="Title, e.g. We deliver on Saturday too" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
        <textarea className="input" rows={4} placeholder="Details" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Details" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> Pin to the top</label>
        <button type="submit" disabled={busy} className="btn-red w-full">{busy ? 'Posting...' : 'Post to the board'}</button>
      </form>

      {msg && <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm">{msg}</p>}

      <div className="space-y-3">
        {items.map((a) => (
          <article key={a.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">{when(a.created_at)}{a.pinned ? ' · Pinned' : ''}{a.is_published ? '' : ' · Hidden'}</p>
            <p className="font-bold">{a.title}</p>
            {a.body && <p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{a.body}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button type="button" className="chip" onClick={() => change(a.id, { pinned: !a.pinned })}>{a.pinned ? 'Unpin' : 'Pin'}</button>
              <button type="button" className="chip" onClick={() => change(a.id, { is_published: !a.is_published })}>{a.is_published ? 'Hide' : 'Show'}</button>
              <button type="button" className="chip" onClick={() => remove(a)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
