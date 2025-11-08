#!/bin/bash

# 🎃 CandyFinder Quick Start Script
# Run this to set up everything automatically

echo "🎃 Welcome to CandyFinder Setup!"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CandyFinder directory"
    echo "   cd /home/gobinda/Hackathon/CandyFinder"
    exit 1
fi

echo "✅ Correct directory detected"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created (using mock data mode)"
    echo "   💡 To use Supabase, edit .env.local with your credentials"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "🎃 Initial commit: CandyFinder - Trick-or-Treat Route Optimizer"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi
echo ""

echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "📍 Your app is ready to run!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start dev server:  npm run dev"
echo "   2. Open browser:      http://localhost:3000"
echo "   3. Read docs:         cat README.md"
echo "   4. Read setup guide:  cat SETUP.md"
echo ""
echo "📊 Quick Commands:"
echo "   • Start dev:          npm run dev"
echo "   • Build production:   npm run build"
echo "   • Run linter:         npm run lint"
echo ""
echo "📁 Important Files:"
echo "   • README.md          - Full documentation"
echo "   • SETUP.md           - Setup & troubleshooting"
echo "   • PRESENTATION.md    - Presentation guide"
echo "   • PROJECT_SUMMARY.md - Complete project overview"
echo ""
echo "🎃 Good luck with your hackathon!"
echo "👻 Built with 💀 for Halloween Fall 2025"
echo ""
