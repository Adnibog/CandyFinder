#!/bin/bash

# =================================================================
# CandyFinder Security Verification Script
# =================================================================
# This script verifies your security setup before deployment
# Run with: bash scripts/verify-security.sh
# =================================================================

echo "🔒 CandyFinder Security Verification"
echo "======================================"
echo ""

ERRORS=0
WARNINGS=0

# Function to print check results
check_pass() {
    echo "✅ $1"
}

check_warn() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

check_fail() {
    echo "❌ $1"
    ((ERRORS++))
}

# ============================================================
# 1. Check .gitignore Configuration
# ============================================================

echo "📋 Checking .gitignore configuration..."
echo ""

if [ ! -f ".gitignore" ]; then
    check_fail ".gitignore file not found"
else
    check_pass ".gitignore file exists"
    
    if grep -q "\.env.*\.local" .gitignore; then
        check_pass ".env*.local is in .gitignore"
    else
        check_fail ".env*.local is NOT in .gitignore (CRITICAL)"
    fi
    
    if grep -q "^\.env$" .gitignore; then
        check_pass ".env is in .gitignore"
    else
        check_warn ".env is not in .gitignore (add if using .env files)"
    fi
    
    if grep -q "node_modules" .gitignore; then
        check_pass "node_modules is in .gitignore"
    else
        check_fail "node_modules is NOT in .gitignore"
    fi
fi

echo ""

# ============================================================
# 2. Check for Exposed Secrets
# ============================================================

echo "🔍 Checking for exposed secrets..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    check_pass ".env.local exists"
    
    # Check if it contains real credentials (not demo)
    if grep -q "demo.supabase.co" .env.local; then
        check_warn ".env.local contains demo credentials (update for production)"
    else
        check_pass ".env.local appears to have real credentials"
    fi
    
    # Check for encryption key
    if grep -q "^ENCRYPTION_KEY=" .env.local; then
        check_pass "ENCRYPTION_KEY is set in .env.local"
        
        # Check if it's the default demo key
        if grep -q "ENCRYPTION_KEY=0123456789abcdef" .env.local; then
            check_warn "Using demo ENCRYPTION_KEY (generate new one with: bash scripts/generate-encryption-key.sh)"
        fi
        
        # Verify key length (should be 64 hex characters)
        KEY_LINE=$(grep "^ENCRYPTION_KEY=" .env.local)
        KEY_VALUE=$(echo "$KEY_LINE" | cut -d'=' -f2)
        KEY_LENGTH=${#KEY_VALUE}
        
        if [ "$KEY_LENGTH" -eq 64 ]; then
            check_pass "ENCRYPTION_KEY has correct length (64 characters)"
        else
            check_fail "ENCRYPTION_KEY has wrong length ($KEY_LENGTH chars, expected 64)"
        fi
    else
        check_fail "ENCRYPTION_KEY not found in .env.local"
    fi
else
    check_fail ".env.local not found (copy from .env.local.example)"
fi

# Check if git is tracking .env.local
if [ -d ".git" ]; then
    if git ls-files --error-unmatch .env.local 2>/dev/null; then
        check_fail ".env.local is tracked by git (CRITICAL SECURITY ISSUE)"
        echo "    Run: git rm --cached .env.local"
    else
        check_pass ".env.local is not tracked by git"
    fi
fi

echo ""

# ============================================================
# 3. Check Git History for Secrets
# ============================================================

echo "📜 Checking git history for secrets..."
echo ""

if [ -d ".git" ]; then
    # Check if .env.local was ever committed
    if git log --all --full-history -- .env.local 2>/dev/null | grep -q commit; then
        check_fail ".env.local was previously committed to git (ROTATE ALL CREDENTIALS)"
        echo "    See SECURITY_SETUP.md for credential rotation steps"
    else
        check_pass "No .env.local found in git history"
    fi
    
    # Check for common secret patterns in history
    if git log --all -p 2>/dev/null | grep -i "SUPABASE_SERVICE_ROLE_KEY" | grep -v "your-service-role-key-here" | grep -q .; then
        check_warn "Possible service role key found in git history"
    fi
else
    check_warn "Git repository not initialized"
fi

echo ""

# ============================================================
# 4. Check Environment Variables Structure
# ============================================================

echo "📝 Checking environment variables structure..."
echo ""

if [ -f ".env.local" ]; then
    # Public keys should start with NEXT_PUBLIC_
    if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL is correctly prefixed"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL not found or incorrectly named"
    fi
    
    if grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly prefixed"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY not found or incorrectly named"
    fi
    
    # Secret keys should NOT have NEXT_PUBLIC_ prefix
    if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env.local; then
        check_pass "SUPABASE_SERVICE_ROLE_KEY is correctly NOT public"
    fi
    
    if grep -q "^NEXT_PUBLIC_.*SERVICE_ROLE" .env.local; then
        check_fail "Service role key is marked as public (CRITICAL SECURITY ISSUE)"
    else
        check_pass "No service role keys exposed as public"
    fi
fi

echo ""

# ============================================================
# 5. Check File Permissions
# ============================================================

echo "🔐 Checking file permissions..."
echo ""

if [ -f ".env.local" ]; then
    PERMS=$(stat -c "%a" .env.local 2>/dev/null || stat -f "%A" .env.local 2>/dev/null)
    
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ]; then
        check_pass ".env.local has secure permissions ($PERMS)"
    else
        check_warn ".env.local permissions are $PERMS (recommend 600)"
        echo "    Run: chmod 600 .env.local"
    fi
fi

echo ""

# ============================================================
# 6. Check Source Code for Hardcoded Secrets
# ============================================================

echo "💻 Checking source code for hardcoded secrets..."
echo ""

# Check for hardcoded URLs or keys in TypeScript files
if grep -r "https://.*\.supabase\.co" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules . | grep -v "demo.supabase.co" | grep -v "your-project" | grep -v "process.env" | grep -q .; then
    check_warn "Possible hardcoded Supabase URL found in source code"
else
    check_pass "No hardcoded Supabase URLs in source"
fi

# Check for hardcoded keys
if grep -r "eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules . | grep -v "example" | grep -v "demo" | grep -q .; then
    check_warn "Possible hardcoded JWT/API key found in source code"
else
    check_pass "No obvious hardcoded keys in source"
fi

echo ""

# ============================================================
# 7. Check Dependencies
# ============================================================

echo "📦 Checking dependencies for vulnerabilities..."
echo ""

if command -v npm &> /dev/null; then
    # Run npm audit (non-blocking)
    if npm audit --production 2>&1 | grep -q "found 0 vulnerabilities"; then
        check_pass "No npm vulnerabilities found"
    else
        check_warn "npm vulnerabilities detected (run: npm audit for details)"
    fi
else
    check_warn "npm not found, skipping dependency check"
fi

echo ""

# ============================================================
# Final Summary
# ============================================================

echo "======================================"
echo "📊 Security Verification Summary"
echo "======================================"
echo ""
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo ""
    echo "Your application appears to be securely configured."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Security checks passed with $WARNINGS warning(s)"
    echo ""
    echo "Review warnings above before deploying to production."
    exit 0
else
    echo "❌ Security checks failed with $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "CRITICAL: Fix all errors before deploying!"
    echo "See SECURITY_SETUP.md for detailed security guidelines."
    exit 1
fi
