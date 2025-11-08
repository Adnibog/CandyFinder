'use client'

import { useState } from 'react'
import { X, Flag, AlertTriangle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  houseId: string
  houseAddress: string
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  houseId, 
  houseAddress 
}: ReportModalProps) {
  const { user } = useUser()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const reportReasons = [
    'Fake/Invalid Address',
    'House Does Not Exist',
    'Inappropriate Content',
    'Duplicate Entry',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to report houses')
      return
    }

    if (!reason) {
      toast.error('Please select a reason')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            house_id: houseId,
            clerk_user_id: user.id,
            reason: reason,
            details: details.trim() || null
          }
        ])
      
      if (error) throw error
      
      toast.success('Report submitted. Thank you for keeping our community safe! 🛡️')
      onClose()
      
      // Reset form
      setReason('')
      setDetails('')
    } catch (error: any) {
      toast.error('Failed to submit report: ' + error.message)
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
      <div className="relative w-full max-w-md bg-halloween-dark border-2 border-red-500 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Report House</h2>
          </div>
          <p className="text-sm text-gray-400">{houseAddress}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for Report *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label
                  key={reportReason}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    reason === reportReason
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 hover:border-red-500/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="text-white text-sm">{reportReason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional information..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-red-500 focus:outline-none text-white placeholder-gray-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{details.length}/500</p>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              <Flag className="w-4 h-4 inline mr-1" />
              False reports may result in account suspension. Only report genuine issues.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
