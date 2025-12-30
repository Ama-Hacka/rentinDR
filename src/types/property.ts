export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  rooms: number
  square_meters: number
  pets_allowed: boolean
  negotiable: boolean
  negotiable_items: string[]
  status: 'active' | 'inactive' | 'rented'
  owner_id: string
  created_at: string
  updated_at: string
  thumbnail_url?: string
  contact_phone?: string
  contact_email?: string
  source_url?: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  order_index: number
  created_at: string
}

export interface PropertyAmenity {
  id: string
  property_id: string
  amenity_name: string
  created_at: string
}

export interface PropertyWithDetails extends Property {
  images: PropertyImage[]
  amenities: PropertyAmenity[]
}

export interface PropertyFilters {
  price_min?: number
  price_max?: number
  rooms?: number
  square_meters_min?: number
  square_meters_max?: number
  pets_allowed?: boolean
  amenities?: string[]
  location?: string
  favorites_only?: boolean
  search_query?: string
}
