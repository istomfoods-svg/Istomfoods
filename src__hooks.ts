import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Announcement, Product } from './types'

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

export function useAnnouncements(limit = 50) {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error) setItems((data ?? []) as Announcement[])
        setLoading(false)
      })
  }, [limit])

  return { items, loading }
}
