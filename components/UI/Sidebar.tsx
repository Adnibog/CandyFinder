'use client'

import { useState, useEffect } from 'react'
import { Filter, Star, MapPin, Edit2, Trash2, Save, X, Candy, Ghost, Flag } from 'lucide-react'
import { CandyHouse } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import RatingModal from '../Map/RatingModal'
import ReportModal from '../Map/ReportModal'

interface SidebarProps {
  selectedRange: number
  onRangeChange: (range: number) => void
  userLocation: [number, number] | null
}

export default function Sidebar({
  selectedRange,
  onRangeChange,
  userLocation
}: SidebarProps) {
  const { user } = useUser()
  const [houses, setHouses] = useState<CandyHouse[]>([])
  const [filterType, setFilterType] = useState<'all' | 'my-houses'>('all')
  const [editingHouse, setEditingHouse] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ candy_types: '', notes: '' })
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<{ id: string; address: string } | null>(null)

  // Load houses from Supabase with ratings
  const loadHouses = async () => {
    try {
      // Fetch houses with their ratings
      const { data: housesData, error: housesError } = await supabase
        .from('candy_houses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (housesError) throw housesError
      
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
      
      const converted: CandyHouse[] = (housesData || []).map((house: any) => {
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
          user_id: house.clerk_user_id,
          user_email: house.user_email,
          user_name: house.user_name,
          created_at: house.created_at,
          avg_candy_rating: candyAvg,
          avg_decoration_rating: spookyAvg,
          avg_scariness_rating: spookyAvg,
          avg_overall_rating: overallAvg,
          rating_count: ratingCount,
        }
      })
      
      setHouses(converted)
    } catch (error) {
      console.error('Error loading houses:', error)
    }
  }

  useEffect(() => {
    loadHouses()
    
    const handleHouseAdded = () => loadHouses()
    window.addEventListener('houseAdded', handleHouseAdded)
    window.addEventListener('storage', handleHouseAdded)
    
    return () => {
      window.removeEventListener('houseAdded', handleHouseAdded)
      window.removeEventListener('storage', handleHouseAdded)
    }
  }, [])

  // Delete house
  const handleDelete = async (houseId: string) => {
    if (!confirm('Are you sure you want to delete this candy house?')) return
    
    try {
      const { error } = await supabase
        .from('candy_houses')
        .delete()
        .eq('id', houseId)
      
      if (error) throw error
      
      toast.success('Candy house deleted! 🗑️')
      loadHouses()
      window.dispatchEvent(new Event('storage'))
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message)
    }
  }

  // Start editing
  const handleEdit = (house: CandyHouse) => {
    setEditingHouse(house.id)
    setEditForm({
      candy_types: house.candy_types[0] || '',
      notes: house.notes || ''
    })
  }

  // Save edit
  const handleSave = async (houseId: string) => {
    try {
      const { error } = await supabase
        .from('candy_houses')
        .update({
          candy_types: editForm.candy_types,
          notes: editForm.notes
        })
        .eq('id', houseId)
      
      if (error) throw error
      
      toast.success('Updated successfully! ✅')
      setEditingHouse(null)
      loadHouses()
      window.dispatchEvent(new Event('storage'))
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message)
    }
  }

  // Filter houses
  const getFilteredHouses = () => {
    let filtered = houses

    // Filter by ownership
    if (filterType === 'my-houses' && user) {
      filtered = houses.filter(h => h.user_id === user.id)
    }

    // Filter by range if location available
    if (userLocation) {
      filtered = filtered.filter(house => {
        const distance = calculateDistance(userLocation, [house.latitude, house.longitude])
        return distance <= selectedRange
      })
      
      // Sort by distance (nearest first)
      filtered = filtered.sort((a, b) => {
        const distA = calculateDistance(userLocation, [a.latitude, a.longitude])
        const distB = calculateDistance(userLocation, [b.latitude, b.longitude])
        return distA - distB
      })
    }

    return filtered
  }

  const calculateDistance = (from: [number, number], to: [number, number]) => {
    const R = 3959 // miles
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

  const filteredHouses = getFilteredHouses()

  return (
    <div className="w-96 bg-halloween-dark border-r-2 border-halloween-orange overflow-y-auto h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-halloween-orange flex items-center gap-2">
            <Candy className="w-6 h-6" />
            Candy Houses
          </h2>
          <span className="text-white bg-halloween-purple px-3 py-1 rounded-full text-sm">
            {filteredHouses.length}
          </span>
        </div>

        {/* Range Slider */}
        <div className="bg-halloween-darker rounded-lg p-4 border border-halloween-purple/30">
          <label className="block text-white mb-2 font-semibold">
            Range: {selectedRange} miles
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={selectedRange}
            onChange={(e) => onRangeChange(Number(e.target.value))}
            className="w-full h-2 bg-halloween-purple rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              filterType === 'all'
                ? 'bg-halloween-orange text-white'
                : 'bg-halloween-darker text-gray-400 hover:text-white'
            }`}
          >
            All Houses
          </button>
          <button
            onClick={() => setFilterType('my-houses')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              filterType === 'my-houses'
                ? 'bg-halloween-orange text-white'
                : 'bg-halloween-darker text-gray-400 hover:text-white'
            }`}
          >
            My Houses
          </button>
        </div>

        {/* House List */}
        <div className="space-y-3">
          {filteredHouses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Candy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No candy houses found</p>
              <p className="text-sm mt-1">Add one to get started!</p>
            </div>
          ) : (
            filteredHouses.map((house) => {
              const isEditing = editingHouse === house.id
              const isOwner = user && house.user_id === user.id
              const distance = userLocation 
                ? calculateDistance(userLocation, [house.latitude, house.longitude])
                : null

              return (
                <div
                  key={house.id}
                  className="bg-halloween-darker rounded-lg p-4 border border-halloween-purple/30 hover:border-halloween-orange/50 transition"
                >
                  {/* Address */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-halloween-orange font-semibold mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{house.address}</span>
                      </div>
                      
                      {/* Distance Badge */}
                      {distance !== null && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs bg-halloween-purple/20 text-halloween-purple px-2 py-1 rounded-full">
                            📍 {distance < 0.1 ? '< 0.1' : distance.toFixed(1)} mi away
                          </span>
                        </div>
                      )}
                      
                      {/* Rating Display */}
                      <div className="space-y-1 mt-2">
                        {/* Candy Rating */}
                        <div className="flex items-center gap-2">
                          <Candy className="w-3 h-3 text-halloween-orange" />
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= (house.avg_candy_rating || 0) 
                                    ? 'fill-halloween-orange text-halloween-orange' 
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {house.avg_candy_rating && house.avg_candy_rating > 0 ? house.avg_candy_rating.toFixed(1) : 'No ratings'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Spooky Rating */}
                        <div className="flex items-center gap-2">
                          <Ghost className="w-3 h-3 text-halloween-purple" />
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= (house.avg_decoration_rating || 0)
                                    ? 'fill-halloween-purple text-halloween-purple'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {house.avg_decoration_rating && house.avg_decoration_rating > 0 ? house.avg_decoration_rating.toFixed(1) : 'No ratings'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Overall Rating */}
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= (house.avg_overall_rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                              {house.avg_overall_rating && house.avg_overall_rating > 0 ? house.avg_overall_rating.toFixed(1) : 'No ratings'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Rating Count */}
                        {(house.rating_count || 0) > 0 && (
                          <p className="text-xs text-gray-500">
                            {house.rating_count} {house.rating_count === 1 ? 'review' : 'reviews'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions for owner */}
                    {isOwner && !isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(house)}
                          className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(house.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Editable Fields */}
                  {isEditing ? (
                    <div className="space-y-2 mt-3">
                      <input
                        type="text"
                        placeholder="Candy types (e.g., Full-size bars, Chocolate)"
                        value={editForm.candy_types}
                        onChange={(e) => setEditForm({ ...editForm, candy_types: e.target.value })}
                        className="w-full px-3 py-2 bg-halloween-dark border border-halloween-purple rounded text-white text-sm"
                      />
                      <textarea
                        placeholder="Notes or special instructions"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-halloween-dark border border-halloween-purple rounded text-white text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(house.id)}
                          className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-semibold flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingHouse(null)}
                          className="flex-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-semibold flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Candy Types */}
                      {house.candy_types.length > 0 && house.candy_types[0] && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">Candy Available:</p>
                          <p className="text-sm text-white">{house.candy_types[0]}</p>
                        </div>
                      )}

                      {/* User Info */}
                      {(house.user_name || house.user_email) && (
                        <p className="text-xs text-gray-500 mt-2">
                          Added by: {house.user_name || house.user_email}
                        </p>
                      )}
                      
                      {/* Rating and Report Buttons - Only show for other users' houses */}
                      {!isOwner && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setSelectedHouse({ id: house.id, address: house.address })
                              setRatingModalOpen(true)
                            }}
                            className="flex-1 px-3 py-2 bg-halloween-orange/20 hover:bg-halloween-orange/30 text-halloween-orange rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <Star className="w-3 h-3" />
                            Rate House
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHouse({ id: house.id, address: house.address })
                              setReportModalOpen(true)
                            }}
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                            title="Report fake address"
                          >
                            <Flag className="w-3 h-3" />
                            Report
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
      
      {/* Modals */}
      {selectedHouse && (
        <>
          <RatingModal
            isOpen={ratingModalOpen}
            onClose={() => {
              setRatingModalOpen(false)
              setSelectedHouse(null)
            }}
            houseId={selectedHouse.id}
            houseAddress={selectedHouse.address}
            onRatingSubmitted={() => {
              loadHouses()
            }}
          />
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => {
              setReportModalOpen(false)
              setSelectedHouse(null)
            }}
            houseId={selectedHouse.id}
            houseAddress={selectedHouse.address}
          />
        </>
      )}
    </div>
  )
}
