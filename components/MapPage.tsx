'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Sidebar from '@/components/UI/Sidebar'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import LocationPermission from '@/components/UI/LocationPermission'

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

export default function MapPage() {
  const [selectedRange, setSelectedRange] = useState(1) // miles
  const [selectedHouses, setSelectedHouses] = useState<string[]>([])
  const [showOptimizedRoute, setShowOptimizedRoute] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationGranted, setLocationGranted] = useState(false)

  const handleLocationGranted = (lat: number, lng: number) => {
    setUserLocation([lat, lng])
    setLocationGranted(true)
  }

  const handleLocationDenied = () => {
    // Set default location (New York City)
    setUserLocation([40.7128, -74.0060])
    setLocationGranted(true)
  }

  return (
    <div className="flex h-screen overflow-hidden pt-16">
      {/* Location Permission Modal */}
      {!locationGranted && (
        <LocationPermission
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        userLocation={userLocation}
      />
      
      {/* Map */}
      <div className="flex-1 relative">
        {locationGranted && userLocation && (
          <MapView 
            range={selectedRange}
            selectedHouses={selectedHouses}
            showOptimizedRoute={showOptimizedRoute}
            userLocation={userLocation}
          />
        )}
        {locationGranted && !userLocation && <LoadingSpinner />}
      </div>
    </div>
  )
}
