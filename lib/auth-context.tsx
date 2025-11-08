import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isDemoMode } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<void>
  verifyEmail: (code: string) => Promise<void>
  resendVerificationCode: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: Check local storage for user
      const storedUser = localStorage.getItem('demo_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData as User)
      }
      setLoading(false)
    } else {
      // Real Supabase mode
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

    const signUp = async (email: string, password: string, fullName: string) => {
    if (isDemoMode) {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const demoUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { 
          full_name: fullName,
          email_verified: false,
          verification_code: verificationCode
        },
        created_at: new Date().toISOString(),
      }
      
      // Try to send email via API
      try {
        const response = await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode, name: fullName })
        })
        
        const result = await response.json()
        
        if (result.demo) {
          console.log('📧 DEMO MODE - Verification Email Sent')
          console.log('==========================================')
          console.log('To:', email)
          console.log('Verification Code:', verificationCode)
          console.log('==========================================')
          console.log('Please check browser console for verification code')
        } else if (result.success) {
          console.log('✅ Verification email sent successfully to:', email)
        }
      } catch (error) {
        console.error('Error sending verification email:', error)
        console.log('📧 DEMO MODE - Verification Email Sent')
        console.log('==========================================')
        console.log('To:', email)
        console.log('Verification Code:', verificationCode)
        console.log('==========================================')
      }
      
      localStorage.setItem('demo_user_pending', JSON.stringify(demoUser))
      localStorage.setItem('demo_users_db', JSON.stringify([
        ...(JSON.parse(localStorage.getItem('demo_users_db') || '[]')),
        { email, password, fullName, createdAt: new Date().toISOString(), verified: false }
      ]))
      
      // Don't auto-login, require verification first
      return
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode: Check local storage
      const users = JSON.parse(localStorage.getItem('demo_users_db') || '[]')
      const foundUser = users.find((u: any) => u.email === email && u.password === password)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }
      
      const demoUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { full_name: foundUser.fullName },
        created_at: foundUser.createdAt,
      }
      localStorage.setItem('demo_user', JSON.stringify(demoUser))
      setUser(demoUser as unknown as User)
      return
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (isDemoMode) {
      // Demo mode: Clear local storage
      localStorage.removeItem('demo_user')
      setUser(null)
      return
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    if (isDemoMode) {
      // Demo mode: Just show success (no actual email sent)
      console.log('Demo mode: Password reset requested for', email)
      return
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    if (error) throw error
  }

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    if (isDemoMode) {
      // Demo mode: Update local storage
      const storedUser = localStorage.getItem('demo_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.user_metadata = { ...userData.user_metadata, ...data }
        localStorage.setItem('demo_user', JSON.stringify(userData))
        setUser(userData as unknown as User)
      }
      return
    }
    
    const { error } = await supabase.auth.updateUser({
      data,
    })
    if (error) throw error
  }

  const verifyEmail = async (code: string) => {
    if (isDemoMode) {
      const pendingUser = localStorage.getItem('demo_user_pending')
      if (!pendingUser) {
        throw new Error('No pending verification found')
      }
      
      const userData = JSON.parse(pendingUser)
      if (userData.user_metadata.verification_code !== code) {
        throw new Error('Invalid verification code')
      }
      
      // Mark as verified
      userData.user_metadata.email_verified = true
      delete userData.user_metadata.verification_code
      
      // Move to active user
      localStorage.setItem('demo_user', JSON.stringify(userData))
      localStorage.removeItem('demo_user_pending')
      
      // Update users DB
      const users = JSON.parse(localStorage.getItem('demo_users_db') || '[]')
      const userIndex = users.findIndex((u: any) => u.email === userData.email)
      if (userIndex !== -1) {
        users[userIndex].verified = true
        localStorage.setItem('demo_users_db', JSON.stringify(users))
      }
      
      setUser(userData as unknown as User)
      return
    }
    
    // For real Supabase, you'd verify the code here
    throw new Error('Email verification not implemented for production mode')
  }

  const resendVerificationCode = async () => {
    if (isDemoMode) {
      const pendingUser = localStorage.getItem('demo_user_pending')
      if (!pendingUser) {
        throw new Error('No pending verification found')
      }
      
      const userData = JSON.parse(pendingUser)
      const newCode = Math.floor(100000 + Math.random() * 900000).toString()
      userData.user_metadata.verification_code = newCode
      localStorage.setItem('demo_user_pending', JSON.stringify(userData))
      
      // Try to send email via API
      try {
        const response = await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userData.email, 
            code: newCode, 
            name: userData.user_metadata.full_name 
          })
        })
        
        const result = await response.json()
        
        if (result.demo) {
          console.log('📧 DEMO MODE - New Verification Email Sent')
          console.log('==========================================')
          console.log('To:', userData.email)
          console.log('Verification Code:', newCode)
          console.log('==========================================')
        } else if (result.success) {
          console.log('✅ New verification email sent successfully to:', userData.email)
        }
      } catch (error) {
        console.error('Error resending verification email:', error)
        console.log('📧 DEMO MODE - New Verification Email Sent')
        console.log('==========================================')
        console.log('To:', userData.email)
        console.log('Verification Code:', newCode)
        console.log('==========================================')
      }
      
      return
    }
    
    throw new Error('Resend not implemented for production mode')
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    verifyEmail,
    resendVerificationCode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
