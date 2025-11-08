'use client'

import { useState } from 'react'
import { Search, Navigation, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface MapSearchProps {
  onLocationFound: (lat: number, lng: number, address: string) => void
}

export default function MapSearch({ onLocationFound }: MapSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an address to search')
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        setResults(data)
        setShowResults(true)
      } else {
        toast.error('No results found. Try a different search.')
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    onLocationFound(lat, lng, result.display_name)
    setShowResults(false)
    setSearchQuery('')
    toast.success('Location found! 📍')
  }

  const handleOpenInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md">
      <div className="bg-halloween-dark/95 backdrop-blur-sm border-2 border-halloween-orange rounded-xl shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center p-3 gap-2">
          <Search className="w-5 h-5 text-halloween-orange flex-shrink-0" />
          <input
            type="text"
            placeholder="Search address or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-halloween-orange hover:bg-halloween-purple transition-colors rounded-lg text-white font-semibold text-sm disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {showResults && results.length > 0 && (
          <div className="border-t border-gray-700 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-3 hover:bg-halloween-purple/20 cursor-pointer border-b border-gray-800 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-halloween-orange flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleSelectResult(result)}
                      className="text-white hover:text-halloween-orange text-left w-full transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{result.display_name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {result.type && `${result.type} • `}
                        Click to view on map
                      </p>
                    </button>
                  </div>
                  <button
                    onClick={() => handleOpenInGoogleMaps(parseFloat(result.lat), parseFloat(result.lon))}
                    className="flex items-center gap-1 px-3 py-1 bg-halloween-orange/20 hover:bg-halloween-orange text-white rounded text-xs transition-colors"
                    title="Open in Google Maps"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
