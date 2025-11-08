'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import AddHouseModal from '@/components/Map/AddHouseModal'

export default function Header() {
  const [addHouseModalOpen, setAddHouseModalOpen] = useState(false)
  const { isSignedIn, user } = useUser()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-halloween-dark/95 backdrop-blur-sm border-b-2 border-halloween-orange">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <span className="text-3xl sm:text-4xl animate-pulse">🍬</span>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                CandyFinder
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {isSignedIn ? (
                <>
                  <Link 
                    href="/map" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-halloween-orange transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="hidden md:inline">Map</span>
                  </Link>
                  
                  <button 
                    className="px-2 sm:px-4 py-2 bg-halloween-orange hover:bg-halloween-purple transition-all rounded-lg font-semibold text-white shadow-lg hover:shadow-halloween-orange/50 text-sm sm:text-base"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setAddHouseModalOpen(true)
                    }}
                    type="button"
                  >
                    <span className="hidden sm:inline">Add Candy House</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 sm:w-10 sm:h-10 border-2 border-halloween-orange hover:border-halloween-purple",
                        userButtonPopoverCard: "bg-halloween-dark border-2 border-halloween-orange",
                        userButtonPopoverActionButton: "hover:bg-halloween-purple/20 text-white",
                        userButtonPopoverActionButtonText: "text-white",
                        userButtonPopoverActionButtonIcon: "text-white",
                        userButtonPopoverFooter: "hidden",
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <button className="px-3 sm:px-4 py-2 text-gray-300 hover:text-halloween-orange transition-colors font-semibold text-sm sm:text-base">
                      Sign In
                    </button>
                  </Link>
                  
                  <Link href="/sign-up">
                    <button className="px-3 sm:px-4 py-2 bg-halloween-orange hover:bg-halloween-purple transition-all rounded-lg font-semibold text-white shadow-lg hover:shadow-halloween-orange/50 text-sm sm:text-base">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AddHouseModal
        isOpen={addHouseModalOpen}
        onClose={() => setAddHouseModalOpen(false)}
      />
    </>
  )
}
