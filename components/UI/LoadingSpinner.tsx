'use client'

import { Ghost } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-halloween-darker">
      <div className="text-center">
        <Ghost className="w-16 h-16 text-halloween-orange mx-auto animate-float mb-4" />
        <p className="text-halloween-purple text-lg font-semibold">
          Loading spooky map...
        </p>
      </div>
    </div>
  )
}
