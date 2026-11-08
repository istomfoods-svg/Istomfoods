import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthCtx {
  user: User | null
  loading: boolean
  signUp: (a: { name: string; phone: string; email: string; password: string }) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}

const friendly = (m: string) => {
  if (/already registered|already exists/i.test(m)) return 'That email already has an account. Please sign in instead.'
  if (/invalid login/i.test(m)) return 'Wrong email or password.'
  if (/rate limit/i.test(m)) return 'Too many attempts. Please wait a few minutes and try again.'
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthCtx = {
    user, loading,
    signUp: async ({ name, phone, email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password, options: { data: { full_name: name.trim(), phone: phone.replace(/[\s-]/g, '') } },
      })
      if (error) return friendly(error.message)
      if (!data.session) return 'Account created. Check your email to confirm it, then sign in.'
      return null
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error ? friendly(error.message) : null
    },
    signOut: async () => { await supabase.auth.signOut() },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
