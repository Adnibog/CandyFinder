'use client'

import { useState } from 'react'
import { X, Star, Ghost, Candy, Flag } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  houseId: string
  houseAddress: string
  onRatingSubmitted: () => void
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  houseId, 
  houseAddress,
  onRatingSubmitted 
}: RatingModalProps) {
  const { user } = useUser()
  const [candyRating, setCandyRating] = useState(0)
  const [spookyRating, setSpookyRating] = useState(0)
  const [overallRating, setOverallRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to rate houses')
      return
    }

    if (candyRating === 0 || spookyRating === 0 || overallRating === 0) {
      toast.error('Please rate candy, spooky, and overall quality')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('ratings')
        .insert([
          {
            house_id: houseId,
            clerk_user_id: user.id,
            candy_rating: candyRating,
            spooky_rating: spookyRating,
            overall_rating: overallRating,
            comment: comment.trim() || null
          }
        ])
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You have already rated this house')
        } else {
          throw error
        }
        return
      }
      
      toast.success('Rating submitted! ⭐')
      onRatingSubmitted()
      onClose()
      
      // Reset form
      setCandyRating(0)
      setSpookyRating(0)
      setOverallRating(0)
      setComment('')
    } catch (error: any) {
      toast.error('Failed to submit rating: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md bg-halloween-dark border-2 border-halloween-orange rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-halloween-purple/20 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Rate This House</h2>
          <p className="text-sm text-gray-400">{houseAddress}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candy Rating */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Candy className="w-5 h-5 text-halloween-orange" />
              <span>Candy Quality</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setCandyRating(rating)}
                  className="group"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      rating <= candyRating
                        ? 'fill-halloween-orange text-halloween-orange'
                        : 'text-gray-600 hover:text-halloween-orange/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              {candyRating === 0 ? 'Click to rate' : `${candyRating} ${candyRating === 1 ? 'star' : 'stars'}`}
            </p>
          </div>

          {/* Spooky Rating */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Ghost className="w-5 h-5 text-halloween-purple" />
              <span>Spooky Level</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSpookyRating(rating)}
                  className="group"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      rating <= spookyRating
                        ? 'fill-halloween-purple text-halloween-purple'
                        : 'text-gray-600 hover:text-halloween-purple/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              {spookyRating === 0 ? 'Click to rate' : `${spookyRating} ${spookyRating === 1 ? 'star' : 'stars'}`}
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Overall Experience</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setOverallRating(rating)}
                  className="group"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      rating <= overallRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600 hover:text-yellow-400/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              {overallRating === 0 ? 'Click to rate' : `${overallRating} ${overallRating === 1 ? 'star' : 'stars'}`}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-halloween-orange focus:outline-none text-white placeholder-gray-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || candyRating === 0 || spookyRating === 0 || overallRating === 0}
            className="w-full py-3 bg-gradient-to-r from-halloween-orange to-halloween-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-halloween-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  )
}
