#!/bin/bash

# =================================================================
# CandyFinder Security Setup Script
# =================================================================
# This script helps you set up secure credentials for your app
# Run with: bash scripts/generate-encryption-key.sh
# =================================================================

echo "🔒 CandyFinder Security Setup"
echo "=============================="
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed"
    echo "   Install with: sudo apt-get install openssl (Ubuntu/Debian)"
    echo "   Or: brew install openssl (macOS)"
    exit 1
fi

echo "✅ OpenSSL found"
echo ""

# Generate encryption key
echo "🔑 Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)

echo ""
echo "✅ Encryption key generated!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Your new encryption key (64 hex characters):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "📝 Found .env.local file"
    echo ""
    read -p "Would you like to update .env.local with the new key? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Check if ENCRYPTION_KEY already exists
        if grep -q "^ENCRYPTION_KEY=" .env.local; then
            # Update existing key
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
            else
                # Linux
                sed -i "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
            fi
            echo "✅ Updated ENCRYPTION_KEY in .env.local"
        else
            # Add new key
            echo "" >> .env.local
            echo "# Encryption Key (Generated: $(date))" >> .env.local
            echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.local
            echo "✅ Added ENCRYPTION_KEY to .env.local"
        fi
    else
        echo "⚠️  Please manually copy the key above to your .env.local file"
    fi
else
    echo "⚠️  .env.local not found. Creating from .env.local.example..."
    
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        
        # Add encryption key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
        else
            # Linux
            sed -i "s/^ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.local
        fi
        
        echo "✅ Created .env.local with encryption key"
        echo "⚠️  Please update other credentials in .env.local"
    else
        echo "❌ .env.local.example not found"
        echo "   Please create .env.local manually and add the key above"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SECURITY REMINDERS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ .env.local is in .gitignore - verify with: cat .gitignore | grep .env"
echo "2. ❌ NEVER commit .env.local to git"
echo "3. 🔑 Store this key in your password manager (1Password, LastPass, etc.)"
echo "4. 🚀 In production, set in Vercel dashboard (NOT in code)"
echo "5. 🔄 Rotate this key if it's ever compromised"
echo "6. 👥 Share with team via secure channel (encrypted email, password manager)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env.*\.local" .gitignore && grep -q "^\.env$" .gitignore; then
        echo "✅ .gitignore properly configured for .env files"
    else
        echo "⚠️  Warning: .env files may not be properly gitignored"
        echo "   Add these to .gitignore:"
        echo "   .env*.local"
        echo "   .env"
    fi
else
    echo "❌ .gitignore not found!"
fi

echo ""
echo "📚 For more information, see SECURITY_SETUP.md"
echo ""
echo "✅ Setup complete!"
