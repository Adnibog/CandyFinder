'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Star, Home, Navigation, Edit3 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

interface AddHouseModalProps {
  isOpen: boolean
  onClose: () => void
  userLocation?: { lat: number; lng: number } | null
}

export default function AddHouseModal({ isOpen, onClose, userLocation }: AddHouseModalProps) {
  const { user } = useUser()
  const [step, setStep] = useState<'choose' | 'form'>('choose')
  const [locationMethod, setLocationMethod] = useState<'current' | 'manual' | null>(null)
  const [address, setAddress] = useState('')
  const [candyQuality, setCandyQuality] = useState(3)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setStep('choose')
        setLocationMethod(null)
        setAddress('')
        setCandyQuality(3)
        setNotes('')
        setCurrentLocation(null)
        setGettingLocation(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleUseCurrentLocation = () => {
    setLocationMethod('current')
    setStep('form')
    getCurrentLocation()
  }

  const handleManualEntry = () => {
    setLocationMethod('manual')
    setStep('form')
  }

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
        
        // Reverse geocode to get full address with street, city, state
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          )
          const data = await response.json()
          
          if (data.address) {
            // Build a proper full address
            const parts = []
            if (data.address.house_number) parts.push(data.address.house_number)
            if (data.address.road) parts.push(data.address.road)
            if (data.address.suburb || data.address.neighbourhood) parts.push(data.address.suburb || data.address.neighbourhood)
            if (data.address.city || data.address.town) parts.push(data.address.city || data.address.town)
            if (data.address.state) parts.push(data.address.state)
            if (data.address.postcode) parts.push(data.address.postcode)
            
            const fullAddress = parts.join(', ')
            setAddress(fullAddress || data.display_name)
            toast.success('Location detected! 📍')
          } else if (data.display_name) {
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
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please enable location access or enter address manually.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location unavailable. Please enter address manually.')
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out. Please try again or enter address manually.')
        } else {
          toast.error('Could not get location. Please enter address manually.')
        }
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!address.trim()) {
      toast.error('Please enter a valid address')
      return
    }
    
    setLoading(true)

    try {
      let lat = currentLocation?.lat || userLocation?.lat || 0
      let lng = currentLocation?.lng || userLocation?.lng || 0
      
      // If manual entry and no coordinates, geocode the address
      if (locationMethod === 'manual' && !currentLocation) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          )
          const data = await response.json()
          
          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat)
            lng = parseFloat(data[0].lon)
            toast.success('Address located on map! 📍')
          } else {
            toast.error('Could not find address on map. House will be added but may not appear correctly.')
          }
        } catch (error) {
          console.error('Error geocoding address:', error)
          toast.error('Could not locate address on map')
        }
      }
      
      // Store in localStorage for demo mode
      const houses = JSON.parse(localStorage.getItem('candy_houses') || '[]')
      const newHouse = {
        id: crypto.randomUUID(),
        address,
        candyQuality,
        notes,
        latitude: lat,
        longitude: lng,
        createdAt: new Date().toISOString(),
        createdBy: user?.emailAddresses[0].emailAddress || user?.id || 'anonymous',
        createdByName: user?.fullName || user?.firstName || 'Anonymous'
      }
      
      houses.push(newHouse)
      localStorage.setItem('candy_houses', JSON.stringify(houses))
      
      // Trigger a storage event to update the map immediately
      window.dispatchEvent(new Event('storage'))
      
      toast.success('Candy house added successfully! 🍬 Visible on map now!')
      
      // Reset form
      setAddress('')
      setCandyQuality(3)
      setNotes('')
      setCurrentLocation(null)
      setStep('choose')
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

        {/* Back Button (only show on form step) */}
        {step === 'form' && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setStep('choose')
              setAddress('')
              setCurrentLocation(null)
            }}
            className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
            title="Back to options"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}

        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🍬</span>
            <span className="text-5xl"></span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Add Candy House
          </h2>
          <p className="text-gray-400 text-sm">
            {step === 'choose' ? 'Choose how to add location' : 'Share a great trick-or-treat spot!'}
          </p>
        </div>

        {/* Step 1: Choose Location Method */}
        {step === 'choose' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
              className="w-full p-6 bg-gradient-to-r from-halloween-orange to-halloween-purple rounded-xl hover:shadow-lg hover:shadow-halloween-orange/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Navigation className={`w-8 h-8 text-white ${gettingLocation ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-white mb-1">Use Current Location</h3>
                  <p className="text-sm text-white/80">Automatically detect where you are now</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleManualEntry}
              className="w-full p-6 bg-halloween-dark border-2 border-gray-600 rounded-xl hover:border-halloween-orange transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-halloween-orange/20 transition-colors">
                  <Edit3 className="w-8 h-8 text-gray-300 group-hover:text-halloween-orange transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-white mb-1">Enter Manually</h3>
                  <p className="text-sm text-gray-400">Type the address yourself</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Full House Address * 
              {locationMethod === 'manual' && (
                <span className="text-xs text-gray-400 ml-2">(Include street number, street name, city, state, ZIP)</span>
              )}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={locationMethod === 'manual' ? "e.g., 123 Main Street, Springfield, IL 62701" : "123 Main Street"}
                required
                minLength={10}
                className="w-full pl-10 pr-20 py-3 bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-halloween-orange focus:outline-none text-white placeholder-gray-500"
              />
              {locationMethod === 'current' && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-halloween-orange/20 hover:bg-halloween-orange/30 transition-colors disabled:opacity-50"
                  title="Refresh location"
                >
                  <Navigation className={`w-4 h-4 text-halloween-orange ${gettingLocation ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            {gettingLocation && (
              <p className="text-xs text-gray-400 mt-1">Getting your location...</p>
            )}
            {locationMethod === 'manual' && (
              <p className="text-xs text-gray-400 mt-1">Please enter complete address for accurate map placement</p>
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
        )}
      </div>
    </div>
  )
}
