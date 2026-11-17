import { SHARE_TEXT, SHARE_URL } from '../lib/brand'

export default function ShareButton({ className = 'btn-outline w-full', label = 'Tell a friend' }: { className?: string; label?: string }) {
  const share = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try { await navigator.share({ title: 'Istom Foods', text: SHARE_TEXT, url: SHARE_URL }) } catch { /* cancelled */ }
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`, '_blank', 'noopener')
  }
  return <button type="button" onClick={share} className={className}>{label}</button>
}
