# CandyFinder Workspace Structure

## Directory Organization

```
CandyFinder/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles with Halloween theme
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page (HomePage component)
│   └── map/                     # Map page route
│       └── page.tsx
│
├── components/                   # React Components
│   ├── Auth/                    # Authentication components
│   │   └── AuthModal.tsx       # Sign in/Sign up modal
│   ├── UI/                      # Reusable UI components
│   │   ├── MapView.tsx         # Leaflet map integration
│   │   ├── HouseCard.tsx       # Candy house display card
│   │   └── RouteOptimizer.tsx  # AI route optimization
│   └── HomePage.tsx             # Landing page component
│
├── lib/                         # Utility libraries
│   ├── auth-context.tsx        # Authentication context provider
│   ├── encryption.ts           # AES-256-GCM encryption utilities
│   ├── supabase.ts             # Supabase client configuration
│   └── types.ts                # TypeScript type definitions
│
├── scripts/                     # Utility scripts
│   └── verify-security.sh      # Security verification script
│
├── docs/                        # Documentation
│   ├── HACKATHON_CHECKLIST.md  # Development checklist
│   ├── PRESENTATION.md         # Hackathon presentation guide
│   ├── SECURITY_SUMMARY.md     # Security implementation details
│   ├── SETUP.md                # Installation & setup guide
│   ├── WORKSPACE_OPTIMIZATION.md # Workspace cleanup history
│   └── WORKSPACE_STRUCTURE.md  # This file
│
├── .env.local                   # Environment variables (gitignored)
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── next.config.js               # Next.js configuration

```

## Component Architecture

### Pages
- **app/page.tsx**: Landing page with hero section, features, and auth CTAs
- **app/map/page.tsx**: Interactive map with GPS tracking and house markers

### Core Components
- **HomePage.tsx**: Landing page with Halloween animations, clean logo, and auth buttons
- **AuthModal.tsx**: Modal for sign in, sign up, and password reset
- **MapView.tsx**: Leaflet map with custom markers and popups
- **HouseCard.tsx**: Display candy house information with ratings
- **RouteOptimizer.tsx**: AI-powered route optimization

### Authentication Flow
1. User clicks "Get Started" or "Sign In" on HomePage
2. AuthModal opens with appropriate mode
3. User enters credentials
4. Supabase handles authentication
5. User redirected to /map on success

### Security Architecture
- **AES-256-GCM Encryption**: For sensitive data (lib/encryption.ts)
- **Row Level Security**: Supabase policies for data access
- **Environment Variables**: Secured in .env.local (600 permissions)
- **Password Hashing**: bcrypt with cost factor 12

## File Naming Conventions

- **Components**: PascalCase (e.g., `HomePage.tsx`, `AuthModal.tsx`)
- **Utilities**: camelCase (e.g., `encryption.ts`, `auth-context.tsx`)
- **Documentation**: UPPERCASE_WITH_UNDERSCORES.md
- **Directories**: lowercase or PascalCase for component folders

## Style Guidelines

### CSS Organization
- **Tailwind Utilities**: Primary styling method
- **Custom CSS**: Only in `app/globals.css` for:
  - Custom scrollbar
  - Leaflet map theming
  - Range slider styling
  - Animations (@keyframes)

### Color Palette
- **Orange** (#FF6B35): Primary CTA, pumpkins
- **Purple** (#8B5CF6): Secondary actions, accents
- **Green** (#10B981): Success states, tertiary
- **Dark** (#1a1a1a): Background, cards

## Z-Index Hierarchy

```
z-0    - Background animations
z-40   - Main content and footer
z-50   - Header and interactive elements
z-[100] - Modal backdrop
z-[101] - Modal content
```

## Development Workflow

1. **Local Development**: `npm run dev` (port 3000)
2. **Build**: `npm run build`
3. **Production**: `npm start`
4. **Linting**: Automatic with Next.js

## Best Practices

### Component Structure
```tsx
'use client' // If using hooks/interactivity

import { useState } from 'react'
import { ComponentProps } from '@/lib/types'

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State management
  const [state, setState] = useState()
  
  // Event handlers
  const handleEvent = () => { }
  
  // Render
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  )
}
```

### Styling Approach
- Use Tailwind utilities first
- Extract repeated patterns into components
- Use `className` composition for variants
- Add `cursor-pointer` to clickable elements
- Ensure proper z-index layering

### State Management
- Local state with `useState` for component-specific
- Context (`useAuth`) for global authentication
- No external state library needed for this scope

## Security Checklist

- ✅ Encryption utilities implemented (AES-256-GCM)
- ✅ Environment variables secured (.env.local, 600 permissions)
- ✅ Supabase RLS policies active
- ✅ Password hashing with bcrypt
- ✅ No sensitive data in git repository
- ✅ HTTPS enforced in production

## Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Use Next.js `<Image>` component
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: Supabase query caching

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ENCRYPTION_KEY=your_32_byte_key
```

## Troubleshooting

### Common Issues
1. **Buttons not clickable**: Check z-index hierarchy, add `cursor-pointer`
2. **Logo hidden**: Ensure no background elements overlap, use proper z-index
3. **Server port in use**: Kill existing processes with `lsof -ti:3000 | xargs kill -9`
4. **Styles not updating**: Clear `.next` cache, restart dev server

### Debug Commands
```bash
# Check running servers
lsof -i :3000

# Kill all node processes
killall -9 node

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install
```

## Contributing

1. Keep components focused and single-purpose
2. Document complex logic with comments
3. Update this structure doc when adding new directories
4. Follow the established naming conventions
5. Test authentication flow before committing

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
