export interface Product {
  id: string
  name: string
  description: string | null
  price_per_kg: number
  image_url: string | null
  is_active: boolean
  small_portion_enabled: boolean
  sort_order: number
}

/** mode 'weight': qty is kilograms. mode 'amount': qty is Naira (small portions). */
export interface CartItem {
  key: string
  productId: string
  name: string
  pricePerKg: number
  imageUrl: string | null
  mode: 'weight' | 'amount'
  qty: number
}

export interface Settings {
  deliveryFee: number
  whatsapp: string
  smallMin: number
  smallStep: number
  deliveryArea: string
}
