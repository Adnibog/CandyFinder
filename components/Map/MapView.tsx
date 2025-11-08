'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CandyHouse } from '@/lib/types'

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

// Custom pumpkin marker
const pumpkinIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="font-size: 32px;">🎃</div>',
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

  useEffect(() => {
    // Generate mock houses around user's location
    const mockHouses: CandyHouse[] = []
    
    if (userLocation) {
      const [userLat, userLng] = userLocation
      
      // Create houses at different distances
      const offsets = [
        { lat: 0.002, lng: 0.002 },
        { lat: -0.003, lng: 0.004 },
        { lat: 0.008, lng: -0.006 },
        { lat: -0.012, lng: 0.009 },
        { lat: 0.015, lng: 0.012 },
        { lat: -0.025, lng: -0.020 },
        { lat: 0.035, lng: 0.030 },
      ]
      
      offsets.forEach((offset, index) => {
        mockHouses.push({
          id: `house-${index + 1}`,
          latitude: userLat + offset.lat,
          longitude: userLng + offset.lng,
          address: `${100 + index * 50} ${['Spooky Lane', 'Haunted Ave', 'Candy Court', 'Pumpkin St', 'Ghost Rd', 'Witch Way', 'Skeleton Dr'][index]}`,
          candy_types: [
            ['Chocolate', 'Gummy Bears'],
            ['Candy Corn', 'Lollipops'],
            ['Skittles', 'M&Ms'],
            ['Snickers', 'Reeses'],
            ['Twix', 'KitKat'],
            ['Starburst', 'Jolly Ranchers'],
            ['Sour Patch', 'Swedish Fish']
          ][index],
          notes: [
            '🎃 Full-size candy bars!',
            '👻 Amazing decorations!',
            '🍬 King-size treats',
            '🦇 Spooky yard display',
            '💀 Super scary house!',
            '🕷️ Fun haunted maze',
            '🎭 Interactive decorations'
          ][index],
          is_active: true,
          user_id: `user${index + 1}`,
          created_at: new Date().toISOString(),
          avg_candy_rating: 5 - Math.floor(index / 2),
          avg_decoration_rating: 5 - Math.floor(index / 3),
          avg_scariness_rating: Math.min(5, index + 1),
        })
      })
    }
    
    setHouses(mockHouses)
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
      {houses.map((house) => (
        <Marker
          key={house.id}
          position={[house.latitude, house.longitude]}
          icon={pumpkinIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-bold text-halloween-orange mb-2">{house.address}</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Candy:</strong> {house.candy_types?.join(', ')}</p>
                <p><strong>Notes:</strong> {house.notes}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-halloween-purple/30">
                  <span>🍬 {house.avg_candy_rating?.toFixed(1)}</span>
                  <span>⭐ {house.avg_decoration_rating?.toFixed(1)}</span>
                  <span>👻 {house.avg_scariness_rating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

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
  )
}
