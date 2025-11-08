export interface CandyHouse {
  id: string
  latitude: number
  longitude: number
  address: string
  candy_types: string[]
  notes: string
  is_active: boolean
  user_id: string
  created_at: string
  avg_candy_rating?: number
  avg_decoration_rating?: number
  avg_scariness_rating?: number
}

export interface Rating {
  id: string
  house_id: string
  user_id: string
  candy_quality: number
  decoration_rating: number
  scariness_level: number
  comment: string
  created_at: string
}

export interface Route {
  id: string
  user_id: string
  house_ids: string[]
  optimized_order: string[]
  total_distance: number
  created_at: string
}

export interface UserLocation {
  latitude: number
  longitude: number
}
