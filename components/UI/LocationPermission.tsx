'use client'

import { useState, useEffect } from 'react'
import { MapPin, X, AlertCircle, Navigation } from 'lucide-react'

interface LocationPermissionProps {
  onLocationGranted: (lat: number, lng: number) => void
  onLocationDenied: () => void
}

export default function LocationPermission({ onLocationGranted, onLocationDenied }: LocationPermissionProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')

  useEffect(() => {
    checkPermissionState()
  }, [])

  const checkPermissionState = async () => {
    if (!navigator.permissions) {
      // Fallback for browsers that don't support permissions API
      setShowModal(true)
      return
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      setPermissionState(result.state as 'prompt' | 'granted' | 'denied')
      
      if (result.state === 'prompt') {
        setShowModal(true)
      } else if (result.state === 'granted') {
        requestLocation()
      } else if (result.state === 'denied') {
        setError('Location access was denied. Please enable it in your browser settings.')
        onLocationDenied()
      }

      result.onchange = () => {
        setPermissionState(result.state as 'prompt' | 'granted' | 'denied')
      }
    } catch (err) {
      console.error('Error checking permission:', err)
      setShowModal(true)
    }
  }

  const requestLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
      onLocationDenied()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setIsLoading(false)
        setShowModal(false)
        onLocationGranted(latitude, longitude)
      },
      (error) => {
        setIsLoading(false)
        let errorMessage = 'Unable to get your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable it in browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        setError(errorMessage)
        onLocationDenied()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleAllowLocation = () => {
    requestLocation()
  }

  const handleDeny = () => {
    setShowModal(false)
    onLocationDenied()
  }

  if (!showModal && !error) return null

  return (
    <>
      {/* Error Banner */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <div className="bg-red-500/90 backdrop-blur-sm text-white rounded-lg p-4 shadow-lg border border-red-400">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Location Error</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-halloween-darker rounded-2xl border-2 border-halloween-orange shadow-2xl max-w-md w-full overflow-hidden animate-float">
            {/* Header */}
            <div className="bg-gradient-to-r from-halloween-orange to-halloween-purple p-6">
              <div className="flex items-center justify-center space-x-3">
                <Navigation className="w-8 h-8 text-white animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Enable Location</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <div className="mx-auto w-20 h-20 bg-halloween-orange/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-halloween-orange" />
                </div>
                
                <p className="text-lg text-gray-300">
                  CandyFinder needs your location to show candy houses near you
                </p>
                
                <div className="bg-halloween-dark/50 rounded-lg p-4 space-y-2 text-sm text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="text-halloween-green">✓</span>
                    <p>Find houses within your selected range</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-halloween-green">✓</span>
                    <p>Get accurate distance calculations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-halloween-green">✓</span>
                    <p>Optimize your trick-or-treat route</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Your location is only used locally and never stored on servers
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAllowLocation}
                  disabled={isLoading}
                  className="w-full py-3 bg-halloween-orange hover:bg-halloween-orange/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Allow Location Access</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeny}
                  disabled={isLoading}
                  className="w-full py-3 bg-halloween-dark hover:bg-halloween-dark/80 text-gray-400 hover:text-white font-medium rounded-lg transition-all border border-gray-700"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
