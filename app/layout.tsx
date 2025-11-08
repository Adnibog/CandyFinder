import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/UI/Header'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '🍬 CandyFinder',
  description: 'GPS-powered Halloween trick-or-treating map with community ratings and AI route optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <html lang="en">
        <body className={`${inter.className} bg-halloween-darker text-white`}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #FF6B35',
              },
            }}
          />
        </body>
      </html>
    </Providers>
  )
}
