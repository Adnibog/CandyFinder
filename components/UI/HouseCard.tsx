'use client'

import { Star, MapPin, Candy } from 'lucide-react'
import { CandyHouse } from '@/lib/types'

interface HouseCardProps {
  house: CandyHouse
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function HouseCard({ house, isSelected, onSelect }: HouseCardProps) {
  return (
    <div
      onClick={() => onSelect(house.id)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-halloween-orange bg-halloween-orange/10 shadow-halloween-orange/30'
          : 'border-halloween-purple/30 bg-halloween-darker hover:border-halloween-purple'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4 text-halloween-orange" />
            <h4 className="font-semibold text-sm">{house.address}</h4>
          </div>
          
          {/* Ratings */}
          <div className="flex items-center space-x-3 text-xs mb-2">
            <div className="flex items-center space-x-1">
              <Candy className="w-3 h-3 text-yellow-400" />
              <span>{house.avg_candy_rating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-halloween-purple" />
              <span>{house.avg_decoration_rating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-halloween-green">👻</span>
              <span>{house.avg_scariness_rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Selection Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          isSelected 
            ? 'bg-halloween-orange border-halloween-orange' 
            : 'border-gray-500'
        }`}>
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
      </div>

      {/* Candy Types */}
      {house.candy_types && house.candy_types.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {house.candy_types.map((candy, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-halloween-purple/30 text-xs rounded-full"
            >
              {candy}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {house.notes && (
        <p className="text-xs text-gray-400 italic">&quot;{house.notes}&quot;</p>
      )}
    </div>
  )
}
