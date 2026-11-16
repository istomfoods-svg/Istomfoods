export const CUTOFF_TITLE = 'Assorted meat orders close at 10:00am for fast delivery.'
export const CUTOFF_TIP = 'Booking a day before is best, but it is not compulsory.'

export default function CutoffNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div role="note" className={`flex items-start gap-3 rounded-2xl border border-orange-300/30 bg-orange-400/10 ${compact ? 'p-3 text-sm' : 'p-4'}`}>
      <span aria-hidden="true" className="text-xl">⏰</span>
      <p><span className="font-bold">{CUTOFF_TITLE}</span> <span className="opacity-80">{CUTOFF_TIP}</span></p>
    </div>
  )
}
