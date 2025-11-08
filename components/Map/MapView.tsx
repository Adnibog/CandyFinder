'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CandyHouse } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import MapSearch from './MapSearch'
import { Navigation } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface MapViewProps {
  range: number
  selectedHouses: string[]
  showOptimizedRoute: boolean
  userLocation: [number, number]
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom pumpkin marker for mock houses
const pumpkinIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="font-size: 32px;">🎃</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

// Custom candy marker for user-added houses
const candyIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="font-size: 32px;">🍬</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="font-size: 32px;">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13)
    }
  }, [position, map])

  return (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <p className="font-bold text-halloween-orange">📍 You are here!</p>
          <p className="text-xs text-gray-500 mt-1">Your current location</p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapView({ range, selectedHouses, showOptimizedRoute, userLocation }: MapViewProps) {
  const [houses, setHouses] = useState<CandyHouse[]>([])
  const { user } = useUser()

  const handleLocationFound = (lat: number, lng: number, address: string) => {
    // Map will fly to this location via LocationMarker
    // You could add a temporary marker here if needed
    toast.success(`Found: ${address}`)
  }

  useEffect(() => {
    // Load houses from Supabase database with ratings
    const loadHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('candy_houses')
          .select('*')
        
        if (error) {
          console.error('Error loading houses from Supabase:', error)
          setHouses([])
          return
        }
        
        // Fetch ratings for all houses
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('house_id, candy_rating, spooky_rating, overall_rating')
        
        if (ratingsError) console.error('Error loading ratings:', ratingsError)
        
        // Calculate average ratings for each house
        const ratingsByHouse = (ratingsData || []).reduce((acc: any, rating: any) => {
          if (!acc[rating.house_id]) {
            acc[rating.house_id] = { candyRatings: [], spookyRatings: [], overallRatings: [] }
          }
          acc[rating.house_id].candyRatings.push(rating.candy_rating)
          acc[rating.house_id].spookyRatings.push(rating.spooky_rating)
          acc[rating.house_id].overallRatings.push(rating.overall_rating)
          return acc
        }, {})
        
        // Convert Supabase data to CandyHouse format
        const convertedHouses: CandyHouse[] = (data || []).map((house: any) => {
          const ratings = ratingsByHouse[house.id]
          const candyAvg = ratings 
            ? ratings.candyRatings.reduce((a: number, b: number) => a + b, 0) / ratings.candyRatings.length
            : 0
          const spookyAvg = ratings
            ? ratings.spookyRatings.reduce((a: number, b: number) => a + b, 0) / ratings.spookyRatings.length
            : 0
          const overallAvg = ratings
            ? ratings.overallRatings.reduce((a: number, b: number) => a + b, 0) / ratings.overallRatings.length
            : 0
          const ratingCount = ratings ? ratings.candyRatings.length : 0
          
          return {
            id: house.id,
            latitude: house.latitude,
            longitude: house.longitude,
            address: house.address,
            candy_types: house.candy_types ? [house.candy_types] : [],
            notes: house.notes || '',
            is_active: true,
            user_id: house.clerk_user_id || house.user_id,
            user_name: house.user_name,
            user_email: house.user_email,
            created_at: house.created_at,
            avg_candy_rating: candyAvg,
            avg_decoration_rating: spookyAvg,
            avg_scariness_rating: spookyAvg,
            avg_overall_rating: overallAvg,
            rating_count: ratingCount,
          }
        })
        
        setHouses(convertedHouses)
      } catch (error) {
        console.error('Error loading houses:', error)
        setHouses([])
      }
    }
    
    loadHouses()
    
    // Listen for new houses being added
    const handleHouseAdded = (event: any) => {
      loadHouses()
    }
    
    window.addEventListener('houseAdded', handleHouseAdded)
    
    // Listen for storage changes to reload houses when new ones are added
    const handleStorageChange = () => {
      loadHouses()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('houseAdded', handleHouseAdded)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userLocation])

  // Calculate optimized route
  const routeCoordinates: [number, number][] = showOptimizedRoute && selectedHouses.length > 0
    ? [
        userLocation,
        ...selectedHouses
          .map((id: string) => houses.find((h: CandyHouse) => h.id === id))
          .filter(Boolean)
          .map((h: CandyHouse | undefined) => [h!.latitude, h!.longitude] as [number, number])
      ]
    : []

  return (
    <>
      {/* Search Bar */}
      <MapSearch onLocationFound={handleLocationFound} />
      
      <MapContainer
        center={userLocation}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationMarker position={userLocation} />

      {/* Candy Houses */}
      {houses.map((house) => {
        // Use pumpkin icon for all houses (both user-added and mock)
        const markerIcon = pumpkinIcon
        const isOwner = user && house.user_id === user.id
        
        return (
          <Marker
            key={house.id}
            position={[house.latitude, house.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-halloween-orange mb-2">
                  🍬 {house.address}
                </h3>
                <div className="space-y-1 text-sm">
                  {house.candy_types && house.candy_types.length > 0 && house.candy_types[0] && (
                    <p><strong>Candy:</strong> {house.candy_types.join(', ')}</p>
                  )}
                  
                  {/* Ratings Display */}
                  <div className="mt-2 pt-2 border-t border-halloween-purple/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">🍬 Candy:</span>
                      <span className="font-semibold">
                        {house.avg_candy_rating && house.avg_candy_rating > 0 
                          ? `${house.avg_candy_rating.toFixed(1)}★` 
                          : 'No ratings'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">👻 Spooky:</span>
                      <span className="font-semibold">
                        {house.avg_decoration_rating && house.avg_decoration_rating > 0
                          ? `${house.avg_decoration_rating.toFixed(1)}★`
                          : 'No ratings'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">⭐ Overall:</span>
                      <span className="font-semibold text-yellow-500">
                        {house.avg_overall_rating && house.avg_overall_rating > 0
                          ? `${house.avg_overall_rating.toFixed(1)}★`
                          : 'No ratings'}
                      </span>
                    </div>
                    {(house.rating_count || 0) > 0 && (
                      <p className="text-xs text-gray-600 italic">
                        Based on {house.rating_count} {house.rating_count === 1 ? 'review' : 'reviews'}
                      </p>
                    )}
                  </div>
                  
                  {/* User Info */}
                  {(house.user_name || house.user_email) && (
                    <p className="text-xs text-gray-600 mt-2">
                      Added by: {house.user_name || house.user_email}
                    </p>
                  )}
                  
                  {isOwner && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">✓ Your Added House</p>
                  )}
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${house.latitude},${house.longitude}`, '_blank')}
                    className="w-full mt-3 px-3 py-2 bg-halloween-orange hover:bg-halloween-purple transition-colors rounded text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Optimized Route */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color="#FF6B35"
          weight={4}
          opacity={0.8}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
    </>
  )
}
