'use client'

import Link from 'next/link'
import { Ghost, Candy, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import AuthModal from '@/components/Auth/AuthModal'
import UserMenu from '@/components/Auth/UserMenu'
import AddHouseModal from '@/components/Map/AddHouseModal'

export default function Header() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [addHouseModalOpen, setAddHouseModalOpen] = useState(false)
  const { user } = useAuth()

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-halloween-dark/95 backdrop-blur-sm border-b-2 border-halloween-orange">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <span className="text-4xl animate-pulse">🍬</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                CandyFinder
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    href="/map" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-halloween-orange transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="hidden md:inline">Map</span>
                  </Link>
                  
                  <button 
                    className="px-4 py-2 bg-halloween-orange hover:bg-halloween-purple transition-all rounded-lg font-semibold text-white shadow-lg hover:shadow-halloween-orange/50"
                    onClick={() => setAddHouseModalOpen(true)}
                  >
                    <span className="hidden md:inline">Add Candy House</span>
                    <span className="md:hidden">Add House</span>
                  </button>
                  <UserMenu />
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="px-4 py-2 text-gray-300 hover:text-halloween-orange transition-colors font-semibold"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 bg-halloween-orange hover:bg-halloween-purple transition-all rounded-lg font-semibold text-white shadow-lg hover:shadow-halloween-orange/50"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <AddHouseModal
        isOpen={addHouseModalOpen}
        onClose={() => setAddHouseModalOpen(false)}
      />
    </>
  )
}
