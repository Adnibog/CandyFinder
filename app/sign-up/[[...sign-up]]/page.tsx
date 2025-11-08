'use client'

import { SignUp } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'

export default function SignUpPage() {
  const { isLoaded } = useUser()

  // Show loading animation while redirecting
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-halloween-darker">
        <div className="text-center">
           <div className="text-8xl mb-6 animate-spin">🍬</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to CandyFinder
          </h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-16 px-4 bg-halloween-darker">
      <div className="w-full max-w-md">
        <SignUp 
          redirectUrl="/map"
          appearance={{
            variables: {
              colorPrimary: '#FF6B35',
              colorBackground: '#1a1a1a',
              colorInputBackground: '#2d2d2d',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
            },
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#1a1a1a] border-2 border-orange-500 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "border-gray-600 hover:bg-gray-800 text-white",
              formButtonPrimary: "bg-gradient-to-r from-orange-500 to-purple-600 hover:shadow-lg text-white",
              formFieldLabel: "text-white",
              formFieldInput: "bg-[#2d2d2d] border-gray-600 text-white placeholder:text-gray-400",
              footerActionLink: "text-orange-500 hover:text-purple-500",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-orange-500",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
              dividerLine: "bg-gray-600",
              dividerText: "text-gray-400",
            }
          }}
        />
      </div>
    </div>
  )
}
