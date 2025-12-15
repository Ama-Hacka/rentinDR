import { create } from 'zustand'
import { Property, PropertyWithDetails, PropertyFilters } from '@/types/property'
import { supabase } from '@/lib/supabase'

interface PropertyStore {
  properties: Property[]
  currentProperty: PropertyWithDetails | null
  filters: PropertyFilters
  loading: boolean
  error: string | null
  favorites: string[]
  
  // Actions
  setFilters: (filters: PropertyFilters) => void
  fetchProperties: () => Promise<void>
  fetchPropertyById: (id: string) => Promise<void>
  createProperty: (property: Partial<Property>) => Promise<void>
  fetchOwnerProperties: () => Promise<void>
  updateProperty: (id: string, updates: Partial<Property> & { amenities?: string[], images?: { image_url: string, order_index?: number }[] }) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  loadFavorites: () => Promise<void>
  toggleFavorite: (propertyId: string) => Promise<void>
  isFavorite: (propertyId: string) => boolean
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  currentProperty: null,
  filters: {},
  loading: false,
  error: null,
  favorites: [],

  setFilters: (filters) => set({ filters }),

  fetchProperties: async () => {
    set({ loading: true, error: null })
    try {
      const { filters } = get();

      let query = supabase
        .from('properties')
        .select('*, property_images(image_url, order_index)')
        .eq('status', 'active')

      if (filters.price_min) {
        query = query.gte('price', filters.price_min)
      }
      if (filters.price_max) {
        query = query.lte('price', filters.price_max)
      }
      if (filters.rooms) {
        query = query.eq('rooms', filters.rooms)
      }
      if (filters.square_meters_min) {
        query = query.gte('square_meters', filters.square_meters_min)
      }
      if (filters.square_meters_max) {
        query = query.lte('square_meters', filters.square_meters_max)
      }
      if (filters.pets_allowed !== undefined) {
        query = query.eq('pets_allowed', filters.pets_allowed)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      const { data, error } = await query.order('order_index', { foreignTable: 'property_images', ascending: true })
      if (error) throw error
      const properties = (data || []).map((p: any) => {
        const first = p.property_images?.[0]?.image_url
        return { ...p, thumbnail_url: first }
      })
      const final = filters.favorites_only ? properties.filter((p: any) => get().favorites.includes(p.id)) : properties
      set({ properties: final, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchPropertyById: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (propertyError) throw propertyError

      let ownerPhone: string | null = null
      let ownerEmail: string | null = null
      if (!propertyData.contact_phone && propertyData.owner_id) {
        const { data: ownerRow } = await supabase
          .from('users')
          .select('phone, email')
          .eq('id', propertyData.owner_id)
          .single()
        ownerPhone = (ownerRow as any)?.phone ?? null
        ownerEmail = (ownerRow as any)?.email ?? null
      }

      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('order_index', { ascending: true })

      if (imagesError) throw imagesError

      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('property_amenities')
        .select('*')
        .eq('property_id', id)

      if (amenitiesError) throw amenitiesError

      const propertyWithDetails: PropertyWithDetails = {
        ...propertyData,
        contact_phone: propertyData.contact_phone || ownerPhone || undefined,
        contact_email: (propertyData as any).contact_email || ownerEmail || undefined,
        images: imagesData || [],
        amenities: amenitiesData || []
      }

      set({ currentProperty: propertyWithDetails, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createProperty: async (property) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const role = (user as any).user_metadata?.role
      if (role !== 'owner') throw new Error('Only property owners can create listings')

      const baseInsert = {
        title: property.title || '',
        description: property.description || '',
        price: property.price || 0,
        location: property.location || '',
        rooms: property.rooms || 1,
        square_meters: property.square_meters || 0,
        pets_allowed: property.pets_allowed || false,
        negotiable_items: property.negotiable_items || [],
        contact_phone: (property as any).contact_phone || null,
        owner_id: user.id,
        status: 'active'
      }

      const { data: createdProperty, error: insertError } = await supabase
        .from('properties')
        .insert([baseInsert])
        .select()
        .single()

      if (insertError) throw insertError

      const propertyId = createdProperty.id

      const amenities = (property as any).amenities as string[] | undefined
      if (amenities && amenities.length > 0) {
        const amenityRows = amenities.map((name) => ({
          property_id: propertyId,
          amenity_name: name
        }))
        const { error: amenityError } = await supabase
          .from('property_amenities')
          .insert(amenityRows)
        if (amenityError) throw amenityError
      }

      const images = (property as any).images as { image_url: string; order_index?: number }[] | undefined
      if (images && images.length > 0) {
        const imageRows = images.map((img, idx) => ({
          property_id: propertyId,
          image_url: img.image_url,
          order_index: img.order_index ?? idx
        }))
        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageRows)
        if (imageError) throw imageError
      }

      set((state) => ({
        properties: [...state.properties, createdProperty],
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  fetchOwnerProperties: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(image_url, order_index)')
        .eq('owner_id', user.id)
        .order('order_index', { foreignTable: 'property_images', ascending: true })
      if (error) throw error
      const properties = (data || []).map((p: any) => {
        const first = p.property_images?.[0]?.image_url
        return { ...p, thumbnail_url: first }
      })
      set({ properties, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateProperty: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const baseUpdates: Partial<Property> = {
        title: updates.title,
        description: updates.description,
        price: updates.price,
        location: updates.location,
        rooms: updates.rooms,
        square_meters: updates.square_meters,
        pets_allowed: updates.pets_allowed,
        negotiable_items: updates.negotiable_items,
        contact_phone: (updates as any).contact_phone,
        status: updates.status
      }

      const { data: updated, error: updErr } = await supabase
        .from('properties')
        .update(baseUpdates)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single()
      if (updErr) throw updErr

      if (updates.amenities) {
        await supabase.from('property_amenities').delete().eq('property_id', id)
        if (updates.amenities.length > 0) {
          const amenityRows = updates.amenities.map((name) => ({
            property_id: id,
            amenity_name: name
          }))
          const { error: amenityError } = await supabase
            .from('property_amenities')
            .insert(amenityRows)
          if (amenityError) throw amenityError
        }
      }

      if (updates.images && updates.images.length > 0) {
        const imageRows = updates.images.map((img, idx) => ({
          property_id: id,
          image_url: img.image_url,
          order_index: img.order_index ?? idx
        }))
        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageRows)
        if (imageError) throw imageError
      }

      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? { ...p, ...updated } : p)),
        currentProperty: state.currentProperty && state.currentProperty.id === id
          ? { ...(state.currentProperty as any), ...updated }
          : state.currentProperty,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteProperty: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id)
      if (error) throw error
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        currentProperty: state.currentProperty && state.currentProperty.id === id ? null : state.currentProperty,
        loading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  }
  ,
  loadFavorites: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ favorites: [] })
        return
      }
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)
      if (error) throw error
      const favIds = (data || []).map((r: any) => r.property_id)
      set({ favorites: favIds })
    } catch (error) {
      set({ favorites: [] })
    }
  },
  toggleFavorite: async (propertyId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Please sign in to save favorites')
    const current = get().favorites
    const isFav = current.includes(propertyId)
    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
      if (error) throw error
      set({ favorites: current.filter((id) => id !== propertyId) })
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, property_id: propertyId }])
      if (error) throw error
      set({ favorites: [...current, propertyId] })
    }
  },
  isFavorite: (propertyId) => {
    return get().favorites.includes(propertyId)
  }
})) 
