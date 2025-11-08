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

  const handleLocationFound = (lat: number, lng: number, address: string) => {
    // Map will fly to this location via LocationMarker
    // You could add a temporary marker here if needed
    toast.success(`Found: ${address}`)
  }

  useEffect(() => {
    // Load houses from Supabase database
    const loadHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('candy_houses')
          .select('*')
        
        if (error) {
          console.error('Error loading houses from Supabase:', error)
          // Don't show toast error - fail silently if database not set up yet
          setHouses([])
          return
        }
        
        // Convert Supabase data to CandyHouse format
        const convertedHouses: CandyHouse[] = (data || []).map((house: any) => ({
          id: house.id,
          latitude: house.latitude,
          longitude: house.longitude,
          address: house.address,
          candy_types: house.candy_types ? [house.candy_types] : [],
          notes: house.notes || '',
          is_active: true, // All fetched houses are active
          user_id: house.clerk_user_id || house.user_id,
          created_at: house.created_at,
          avg_candy_rating: 3, // Default rating
          avg_decoration_rating: 3,
          avg_scariness_rating: 3,
        }))
        
        setHouses(convertedHouses)
      } catch (error) {
        console.error('Error loading houses:', error)
        // Don't show toast error - fail silently
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
        const isUserAdded = !house.id.startsWith('house-')
        
        return (
          <Marker
            key={house.id}
            position={[house.latitude, house.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-halloween-orange mb-2">
                  {isUserAdded && '🍬 '}
                  {house.address}
                </h3>
                <div className="space-y-1 text-sm">
                  {house.candy_types && house.candy_types.length > 0 && (
                    <p><strong>Candy:</strong> {house.candy_types.join(', ')}</p>
                  )}
                  {house.notes && <p><strong>Notes:</strong> {house.notes}</p>}
                  <div className="flex justify-between mt-2 pt-2 border-t border-halloween-purple/30">
                    <span>🍬 {house.avg_candy_rating?.toFixed(1)}</span>
                    {house.avg_decoration_rating && <span>⭐ {house.avg_decoration_rating.toFixed(1)}</span>}
                    {house.avg_scariness_rating && <span>👻 {house.avg_scariness_rating.toFixed(1)}</span>}
                  </div>
                  {isUserAdded && (
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
