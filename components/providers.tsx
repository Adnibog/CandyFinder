'use client'

import { ClerkProvider } from '@clerk/nextjs'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#FF6B35',
          colorBackground: '#1a1a1a',
          colorInputBackground: '#2d2d2d',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-purple-600 hover:shadow-lg text-white',
          card: 'bg-[#1a1a1a] border-2 border-orange-500',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
          socialButtonsBlockButton: 'border-gray-600 hover:bg-gray-800 text-white',
          formFieldLabel: 'text-white',
          formFieldInput: 'bg-[#2d2d2d] border-gray-600 text-white placeholder:text-gray-400',
          footerActionLink: 'text-orange-500 hover:text-purple-500',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-orange-500',
          formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
          dividerLine: 'bg-gray-600',
          dividerText: 'text-gray-400',
          // UserButton dropdown styling
          userButtonPopoverCard: 'bg-[#1a1a1a] border-2 border-orange-500',
          userButtonPopoverActionButton: 'hover:bg-purple-600/20 text-white',
          userButtonPopoverActionButtonText: 'text-white',
          userButtonPopoverActionButtonIcon: 'text-white',
          userButtonPopoverFooter: 'hidden',
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
