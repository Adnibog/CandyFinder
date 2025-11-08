/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 * 
 * SECURITY NOTES:
 * - ENCRYPTION_KEY must be 32 bytes (64 hex characters)
 * - Generate key with: openssl rand -hex 32
 * - Store ENCRYPTION_KEY in .env.local (NEVER commit)
 * - In production, store in Vercel environment variables
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Get encryption key from environment
 * Validates key length and format
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY
  
  if (!keyHex) {
    console.warn('⚠️  ENCRYPTION_KEY not set - using demo key (INSECURE)')
    // Demo key for development only - NEVER use in production
    return Buffer.from('0'.repeat(64), 'hex')
  }
  
  // Validate key format
  if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(keyHex, 'hex')
}

/**
 * Encrypt sensitive text data
 * Returns: iv:authTag:encryptedData (all in hex)
 * 
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format "iv:authTag:encryptedData"
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty text')
  }
  
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Combine: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt encrypted data
 * Expects format: iv:authTag:encryptedData (all in hex)
 * 
 * @param encryptedData - Encrypted string from encrypt()
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty data')
  }
  
  try {
    const parts = encryptedData.split(':')
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }
    
    const [ivHex, authTagHex, encrypted] = parts
    
    const key = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash sensitive data (one-way)
 * Use for data that doesn't need to be retrieved (e.g., backup codes)
 * 
 * @param text - Text to hash
 * @returns SHA-256 hash in hex format
 */
export function hash(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex')
}

/**
 * Generate a secure random token
 * Useful for API keys, reset tokens, etc.
 * 
 * @param bytes - Number of random bytes (default: 32)
 * @returns Random token in hex format
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Verify a hash matches the original text
 * Constant-time comparison to prevent timing attacks
 * 
 * @param text - Original text
 * @param hashedText - Hashed text to compare
 * @returns True if hash matches
 */
export function verifyHash(text: string, hashedText: string): boolean {
  const textHash = hash(text)
  
  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(textHash, 'hex'),
    Buffer.from(hashedText, 'hex')
  )
}

/**
 * Example usage:
 * 
 * // Encrypt 2FA secret
 * const secret = 'JBSWY3DPEHPK3PXP'
 * const encrypted = encrypt(secret)
 * // Save encrypted to database
 * 
 * // Decrypt when needed
 * const decrypted = decrypt(encrypted)
 * // Use decrypted secret to verify TOTP
 * 
 * // Hash backup codes (one-way)
 * const backupCode = 'ABC123XYZ'
 * const hashed = hash(backupCode)
 * // Save hashed version
 * 
 * // Verify backup code
 * const isValid = verifyHash(userInputCode, storedHash)
 */
