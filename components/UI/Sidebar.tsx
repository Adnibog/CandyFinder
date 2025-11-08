'use client'

import { useState, useEffect } from 'react'
import { Filter, Route, Star, MapPin, Candy } from 'lucide-react'
import HouseCard from './HouseCard'
import { CandyHouse } from '@/lib/types'

interface SidebarProps {
  selectedRange: number
  onRangeChange: (range: number) => void
  selectedHouses: string[]
  onHouseSelect: (houseIds: string[]) => void
  onOptimizeRoute: () => void
  userLocation: [number, number] | null
}

export default function Sidebar({
  selectedRange,
  onRangeChange,
  selectedHouses,
  onHouseSelect,
  onOptimizeRoute,
  userLocation
}: SidebarProps) {
  const [houses, setHouses] = useState<CandyHouse[]>([])
  const [filteredHouses, setFilteredHouses] = useState<CandyHouse[]>([])
  const [filterType, setFilterType] = useState<'all' | 'top-rated' | 'nearby'>('all')

  // Load houses from localStorage and combine with mock data
  useEffect(() => {
    const loadHouses = () => {
      // Load user-added houses from localStorage
      const storedHouses = localStorage.getItem('candy_houses')
      const realHouses: any[] = storedHouses ? JSON.parse(storedHouses) : []
      
      // Generate mock houses around user's location
      const mockHouses: CandyHouse[] = []
      
      if (userLocation) {
        const [userLat, userLng] = userLocation
        
        // Create houses at different distances
        const offsets = [
          { lat: 0.002, lng: 0.002, distance: 0.3 }, // ~0.3 miles
          { lat: -0.003, lng: 0.004, distance: 0.5 }, // ~0.5 miles
          { lat: 0.008, lng: -0.006, distance: 1.2 }, // ~1.2 miles
          { lat: -0.012, lng: 0.009, distance: 1.8 }, // ~1.8 miles
          { lat: 0.015, lng: 0.012, distance: 2.5 }, // ~2.5 miles
          { lat: -0.025, lng: -0.020, distance: 4.0 }, // ~4 miles
          { lat: 0.035, lng: 0.030, distance: 6.0 }, // ~6 miles
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
      
      // Convert real houses from localStorage to CandyHouse format
      const convertedRealHouses: CandyHouse[] = realHouses.map((house: any) => ({
        id: house.id,
        latitude: house.latitude,
        longitude: house.longitude,
        address: house.address,
        candy_types: [],
        notes: house.notes || '',
        is_active: true,
        user_id: house.createdBy || 'user',
        created_at: house.createdAt,
        avg_candy_rating: house.candyQuality || 3,
        avg_decoration_rating: 3,
        avg_scariness_rating: 3,
      }))
      
      // Combine mock houses with real houses
      setHouses([...mockHouses, ...convertedRealHouses])
    }
    
    loadHouses()
    
    // Listen for storage events to update when new houses are added
    const handleStorageChange = () => {
      loadHouses()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userLocation])

  // Filter houses based on range and user location
  useEffect(() => {
    if (!userLocation) {
      setFilteredHouses([])
      return
    }

    const filtered = houses.filter((house) => {
      // Calculate distance using Haversine formula
      const R = 3959 // Earth's radius in miles
      const dLat = ((house.latitude - userLocation[0]) * Math.PI) / 180
      const dLon = ((house.longitude - userLocation[1]) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation[0] * Math.PI) / 180) *
          Math.cos((house.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      return distance <= selectedRange
    })

    // Apply additional filters
    let result = filtered
    if (filterType === 'top-rated') {
      result = filtered
        .filter((h) => h.avg_candy_rating && h.avg_candy_rating >= 4)
        .sort((a, b) => (b.avg_candy_rating || 0) - (a.avg_candy_rating || 0))
    } else if (filterType === 'nearby') {
      result = filtered.slice().sort((a, b) => {
        const distA = calculateDistance(userLocation, [a.latitude, a.longitude])
        const distB = calculateDistance(userLocation, [b.latitude, b.longitude])
        return distA - distB
      })
    }

    setFilteredHouses(result)
  }, [houses, selectedRange, userLocation, filterType])

  const calculateDistance = (from: [number, number], to: [number, number]) => {
    const R = 3959
    const dLat = ((to[0] - from[0]) * Math.PI) / 180
    const dLon = ((to[1] - from[1]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from[0] * Math.PI) / 180) *
        Math.cos((to[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="w-96 bg-halloween-dark border-r-2 border-halloween-orange overflow-y-auto h-full">
      <div className="p-4 space-y-4">
        {/* Range Filter with Slider */}
        <div className="bg-halloween-darker rounded-lg p-4 border border-halloween-purple/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-halloween-orange" />
              <h3 className="font-semibold">Search Range</h3>
            </div>
            <div className="text-halloween-orange font-bold text-lg">
              {selectedRange} mi
            </div>
          </div>
          
          {/* Slider */}
          <div className="space-y-3">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={selectedRange}
              onChange={(e) => onRangeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-halloween-dark rounded-lg appearance-none cursor-pointer slider-halloween"
            />
            
            {/* Range Labels */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5mi</span>
              <span>2.5mi</span>
              <span>5mi</span>
              <span>7.5mi</span>
              <span>10mi</span>
            </div>
            
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[1, 2, 5, 10].map((range) => (
                <button
                  key={range}
                  onClick={() => onRangeChange(range)}
                  className={`py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedRange === range
                      ? 'bg-halloween-orange text-white'
                      : 'bg-halloween-dark text-gray-400 hover:bg-halloween-purple/30'
                  }`}
                >
                  {range}mi
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Type */}
        <div className="flex space-x-2">
          {['all', 'top-rated', 'nearby'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`flex-1 py-2 rounded-lg capitalize transition-all ${
                filterType === type
                  ? 'bg-halloween-purple text-white'
                  : 'bg-halloween-darker text-gray-400 hover:bg-halloween-purple/30'
              }`}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Optimize Route Button */}
        {selectedHouses.length > 1 && (
          <button
            onClick={onOptimizeRoute}
            className="w-full py-3 bg-gradient-to-r from-halloween-orange to-halloween-purple text-white font-bold rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-halloween-orange/50 transition-all"
          >
            <Route className="w-5 h-5" />
            <span>Optimize Route ({selectedHouses.length} houses)</span>
          </button>
        )}

        {/* Houses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center space-x-2">
              <Candy className="w-5 h-5 text-halloween-orange" />
              <span>Candy Houses ({filteredHouses.length})</span>
            </h3>
          </div>

          {filteredHouses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No candy houses found</p>
              <p className="text-sm mt-1">
                {!userLocation 
                  ? 'Enable location to see houses' 
                  : 'Try increasing your range'}
              </p>
            </div>
          ) : (
            filteredHouses.map((house) => (
              <HouseCard
                key={house.id}
                house={house}
                isSelected={selectedHouses.includes(house.id)}
                onSelect={(id: string) => {
                  if (selectedHouses.includes(id)) {
                    onHouseSelect(selectedHouses.filter(h => h !== id))
                  } else {
                    onHouseSelect([...selectedHouses, id])
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
