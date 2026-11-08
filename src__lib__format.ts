export const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')

export const fmtKg = (kg: number) =>
  kg < 1 ? `${Math.round(kg * 1000)}g` : `${+kg.toFixed(2)}kg`

export const waLink = (number: string, text = '') =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const statusLabel: Record<string, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Paid',
  processing: 'Processing',
  ready_for_delivery: 'Ready for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const feeText = (n: number) => (n === 0 ? 'Free' : naira(n))
