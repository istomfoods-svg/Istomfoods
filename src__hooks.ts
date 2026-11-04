import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Product } from './types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) setError('Could not load products. Check your connection and refresh.')
        else setProducts((data ?? []) as Product[])
        setLoading(false)
      })
  }, [])

  return { products, loading, error }
}
