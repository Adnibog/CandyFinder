export default function CandyFinderLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Simple Pumpkin Emoji Icon */}
      <span className="text-4xl animate-pulse">🎃</span>
      
      {/* Clean Text Logo */}
      <span 
        className={`${dimensions[size]} font-black bg-gradient-to-r from-halloween-orange via-halloween-purple to-halloween-green bg-clip-text text-transparent`}
        style={{ 
          fontFamily: "'Arial Black', Arial, sans-serif",
          textShadow: '0 0 20px rgba(255, 107, 53, 0.3)'
        }}
      >
        CandyFinder
      </span>
      
      {/* Map Pin Accent */}
      <span className="text-2xl text-halloween-purple">📍</span>
    </div>
  )
}
