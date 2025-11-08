'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { MapPin, Star, Shield, Sparkles, Navigation, Users, Candy, Target } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#2d1b3d] to-[#1a0b2e] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-16 h-16 text-5xl animate-float opacity-30">👻</div>
        <div className="absolute top-40 right-20 w-16 h-16 text-5xl animate-spin-slow opacity-30" style={{ animationDelay: '1s' }}>🎃</div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 text-5xl animate-bounce-slow opacity-30" style={{ animationDelay: '2s' }}>🦇</div>
        <div className="absolute bottom-20 right-1/3 w-16 h-16 text-5xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🍬</div>
        <div className="absolute top-1/2 left-20 w-16 h-16 text-5xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🕷️</div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 text-5xl animate-bounce-slow opacity-20" style={{ animationDelay: '2.5s' }}>🕸️</div>
        <div className="absolute bottom-1/3 right-10 w-16 h-16 text-5xl animate-float opacity-25" style={{ animationDelay: '3s' }}>🧙</div>
        <div className="absolute top-2/3 left-1/3 w-16 h-16 text-5xl animate-spin-slow opacity-25" style={{ animationDelay: '1.8s' }}>🌙</div>
      </div>

      <nav className="relative z-50 bg-black/30 backdrop-blur-lg border-b border-orange-500/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl animate-pulse">🍬</span>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">CandyFinder</span>
            </div>
            <div className="flex items-center gap-3">
              {!isSignedIn ? (
                <>
                  <Link href="/sign-in">
                    <button className="px-5 py-2 text-white hover:text-orange-400 font-semibold transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/sign-up">
                    <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                      Sign Up
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300">Welcome, {user?.firstName || user?.emailAddresses[0].emailAddress}</span>
                  </div>
                  <Link href="/map" className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                    Open Map
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border-2 border-halloween-orange hover:border-halloween-purple",
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="container mx-auto px-6 py-12 max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-white">Find the Best </span>
            <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Candy Spots</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">This Halloween 🎃</p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Optimize your trick-or-treating route with real-time GPS mapping, community ratings, and AI-powered suggestions.
          </p>

          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/sign-up">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-2xl hover:scale-105 transition-all">
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Get Started Free</span>
                  </span>
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="px-8 py-4 bg-white/5 border-2 border-white/20 text-white text-lg font-semibold rounded-xl hover:bg-white/10 hover:border-orange-500 transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          ) : (
            <div className="mb-16">
              <Link href="/map" className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-2xl hover:scale-105 transition-all">
                <MapPin className="w-6 h-6" />
                <span>Launch Map</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">GPS Navigation</h3>
              <p className="text-gray-400 text-sm">Real-time location tracking with turn-by-turn directions.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Ratings</h3>
              <p className="text-gray-400 text-sm">See which houses give out the best candy.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-105 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Routes</h3>
              <p className="text-gray-400 text-sm">AI-powered route optimization.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl"></span>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">🍬 CandyFinder</span>
            </div>
            <div className="text-gray-400 text-sm text-center">
              <p>© {new Date().getFullYear()} CandyFinder. All rights reserved.</p>
              <p className="mt-1 text-xs">Making Halloween sweeter, one house at a time 🍬</p>
            </div>
            <div className="flex items-center gap-4 text-2xl">
              <span className="animate-bounce-slow">👻</span>
              <span className="animate-pulse">🦇</span>
              <span className="animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🕷️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
