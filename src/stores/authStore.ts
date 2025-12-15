import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthStore {
  user: any | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: 'seeker' | 'owner') => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateRole: (role: 'seeker' | 'owner') => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, role: 'seeker' | 'owner') => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      })

      if (error) throw error

      if (data.user) {
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email,
            account_type: role
          })
        set({ user: data.user, loading: false })
      } else {
        set({ loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  checkAuth: async () => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, loading: false })
    } catch (error) {
      set({ user: null, loading: false })
    }
  },

  updateRole: async (role: 'seeker' | 'owner') => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const { data, error } = await supabase.auth.updateUser({ data: { role } })
      if (error) throw error
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          account_type: role
        })
      set({ user: data.user, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  }
})) 
