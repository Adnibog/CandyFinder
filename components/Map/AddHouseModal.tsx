'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Star, Home, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddHouseModalProps {
  isOpen: boolean
  onClose: () => void
  userLocation?: { lat: number; lng: number } | null
}

export default function AddHouseModal({ isOpen, onClose, userLocation }: AddHouseModalProps) {
  const [address, setAddress] = useState('')
  const [candyQuality, setCandyQuality] = useState(3)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get current location when modal opens
  useEffect(() => {
    if (isOpen && !currentLocation) {
      getCurrentLocation()
    }
  }, [isOpen])

  const getCurrentLocation = () => {
    setGettingLocation(true)
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCurrentLocation({ lat, lng })
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await response.json()
          if (data.display_name) {
            setAddress(data.display_name)
            toast.success('Location detected! 📍')
          }
        } catch (error) {
          console.error('Error getting address:', error)
          toast.error('Could not get address from location')
        }
        
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        toast.error('Please allow location access or enter address manually')
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      // Store in localStorage for demo mode
      const houses = JSON.parse(localStorage.getItem('candy_houses') || '[]')
      const newHouse = {
        id: crypto.randomUUID(),
        address,
        candyQuality,
        notes,
        latitude: currentLocation?.lat || userLocation?.lat || 0,
        longitude: currentLocation?.lng || userLocation?.lng || 0,
        createdAt: new Date().toISOString(),
        createdBy: localStorage.getItem('demo_user') ? JSON.parse(localStorage.getItem('demo_user')!).email : 'anonymous'
      }
      
      houses.push(newHouse)
      localStorage.setItem('candy_houses', JSON.stringify(houses))
      
      toast.success('Candy house added successfully! 🍬')
      setAddress('')
      setCandyQuality(3)
      setNotes('')
      setCurrentLocation(null)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add house')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation()
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-md bg-halloween-dark border-2 border-halloween-orange rounded-2xl p-6 shadow-2xl z-[101]" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">�</span>
            <span className="text-5xl">�🏠</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Add Candy House
          </h2>
          <p className="text-gray-400 text-sm">
            Share a great trick-or-treat spot!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">House Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                required
                className="w-full pl-10 pr-20 py-3 bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-halloween-orange focus:outline-none text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-halloween-orange/20 hover:bg-halloween-orange/30 transition-colors disabled:opacity-50"
                title="Use current location"
              >
                <Navigation className={`w-4 h-4 text-halloween-orange ${gettingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {gettingLocation && (
              <p className="text-xs text-gray-400 mt-1">Getting your location...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Candy Quality: {candyQuality} / 5 {['😞', '😐', '🙂', '😊', '🤩'][candyQuality - 1]}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setCandyQuality(rating)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    candyQuality >= rating
                      ? 'bg-halloween-orange border-halloween-orange text-white'
                      : 'bg-halloween-dark border-gray-600 text-gray-400 hover:border-halloween-orange'
                  }`}
                >
                  <Star className={`w-5 h-5 mx-auto ${candyQuality >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Great full-size candy bars! Ring doorbell twice."
              rows={3}
              className="w-full px-4 py-3 bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-halloween-orange focus:outline-none text-white placeholder-gray-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !address}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              loading || !address
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-halloween-orange to-halloween-purple hover:shadow-lg hover:shadow-halloween-orange/50'
            }`}
          >
            {loading ? 'Adding House...' : 'Add Candy House 🍬'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Help fellow trick-or-treaters find the best candy!
          </p>
        </form>
      </div>
    </div>
  )
}
