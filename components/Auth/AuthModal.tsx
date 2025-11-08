'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import VerifyEmailModal from './VerifyEmailModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  
  const { signIn, signUp, resetPassword } = useAuth()

  // Sync mode with initialMode when it changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setFullName('')
      setShowPassword(false)
      setLoading(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        toast.success('Welcome back! 👻')
        setEmail('')
        setPassword('')
        onClose()
      } else if (mode === 'signup') {
        await signUp(email, password, fullName)
        // Don't close modal, show verification modal instead
        setPendingEmail(email)
        setEmail('')
        setPassword('')
        setFullName('')
        onClose() // Close auth modal
        setShowVerifyModal(true) // Open verify modal
      } else if (mode === 'reset') {
        await resetPassword(email)
        toast.success('Password reset email sent! 📧')
        setEmail('')
        setMode('signin')
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation()
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-md bg-halloween-dark border-2 border-halloween-orange rounded-2xl p-6 shadow-2xl z-[101]" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-5xl">🍬</span>
            <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">CandyFinder</span>
          </div>
          <p className="text-gray-300 text-base font-medium mb-1">
            {mode === 'signin' && 'Welcome Back! 👻'}
            {mode === 'signup' && 'Join CandyFinder'}
            {mode === 'reset' && 'Reset Password 🔑'}
          </p>
          <p className="text-gray-400 text-sm">
            {mode === 'signin' && 'Sign in to find the best candy spots'}
            {mode === 'signup' && 'Create an account to start optimizing your route'}
            {mode === 'reset' && 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-halloween-darker border border-halloween-purple/30 rounded-lg focus:border-halloween-orange focus:outline-none transition-colors"
                  placeholder="Jack O'Lantern"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-halloween-darker border border-halloween-purple/30 rounded-lg focus:border-halloween-orange focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-halloween-darker border border-halloween-purple/30 rounded-lg focus:border-halloween-orange focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-halloween-orange to-halloween-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-halloween-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('reset')}
                className="text-sm text-halloween-purple hover:text-halloween-orange transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-halloween-orange hover:text-halloween-purple transition-colors font-semibold cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-halloween-orange hover:text-halloween-purple transition-colors font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="text-sm text-halloween-purple hover:text-halloween-orange transition-colors cursor-pointer"
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-6 pt-4 border-t border-halloween-purple/30">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>Secured with Supabase Auth & 2FA Ready</span>
          </div>
        </div>
      </div>
      
      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={pendingEmail}
      />
    </div>
  )
}
