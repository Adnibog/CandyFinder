'use client'

import { useState } from 'react'
import { User, LogOut, Shield, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully! 👋')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-halloween-purple/20 hover:bg-halloween-purple/30 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-halloween-orange rounded-full flex items-center justify-center text-white font-bold">
          {user.user_metadata?.full_name?.[0] || user.email?.[0].toUpperCase()}
        </div>
        <span className="text-sm hidden md:block">{user.user_metadata?.full_name || 'User'}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-halloween-dark border-2 border-halloween-orange rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-halloween-purple/30">
              <p className="font-semibold text-white">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              {user.email_confirmed_at && (
                <div className="flex items-center space-x-1 mt-2">
                  <Shield className="w-4 h-4 text-halloween-green" />
                  <span className="text-xs text-halloween-green">Verified Account</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                className="w-full px-4 py-2 text-left hover:bg-halloween-purple/20 transition-colors flex items-center space-x-2"
                onClick={() => {
                  toast.success('Profile settings coming soon!')
                  setIsOpen(false)
                }}
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>

              <button
                className="w-full px-4 py-2 text-left hover:bg-halloween-purple/20 transition-colors flex items-center space-x-2"
                onClick={() => {
                  toast.success('2FA setup coming soon!')
                  setIsOpen(false)
                }}
              >
                <Shield className="w-4 h-4" />
                <span>Enable 2FA</span>
              </button>

              <button
                className="w-full px-4 py-2 text-left hover:bg-halloween-purple/20 transition-colors flex items-center space-x-2"
                onClick={() => {
                  toast.success('Settings coming soon!')
                  setIsOpen(false)
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-halloween-purple/30 p-2">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-400 transition-colors flex items-center space-x-2 rounded"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
