'use client'

import { useState, useEffect } from 'react'
import { X, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface VerifyEmailModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function VerifyEmailModal({ isOpen, onClose, email }: VerifyEmailModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { verifyEmail, resendVerificationCode } = useAuth()

  useEffect(() => {
    if (isOpen) {
      // Show email sent notification
      toast.success('📧 Verification code sent! Check your email.', {
        duration: 5000,
        icon: '✉️'
      })
    }
  }, [isOpen])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }
    
    setLoading(true)

    try {
      await verifyEmail(verificationCode)
      toast.success('Email verified successfully! 🎉')
      setCode(['', '', '', '', '', ''])
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerificationCode()
      toast.success('New verification code sent! Check console 📧')
      setCode(['', '', '', '', '', ''])
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation()
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🍬</span>
            <Mail className="w-12 h-12 text-halloween-orange" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-halloween-orange font-semibold mt-1">
            {email}
          </p>
          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-xs text-gray-300">
              � Check your email inbox for the 6-digit verification code. It may take a minute to arrive.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              (Demo mode: code also appears in browser console - press F12)
            </p>
          </div>
        </div>

        {/* Verification Code Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-halloween-dark border-2 border-gray-600 rounded-lg focus:border-halloween-orange focus:outline-none text-white"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
              loading || code.join('').length !== 6
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-halloween-orange to-halloween-purple hover:shadow-lg hover:shadow-halloween-orange/50'
            }`}
          >
            {loading ? (
              'Verifying...'
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify Email
              </>
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-gray-400 hover:text-halloween-orange transition-colors underline"
            >
              {resending ? 'Sending...' : "Didn't receive the code? Resend"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Enter the 6-digit code from your email to continue
          </p>
        </form>
      </div>
    </div>
  )
}
