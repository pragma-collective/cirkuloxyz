import jwt, { JwtPayload } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'

// Replace with your Dynamic Environment ID from https://app.dynamic.xyz/dashboard/developer/api
const DYNAMIC_ENV_ID = process.env.DYNAMIC_ENV_ID || 'YOUR_DYNAMIC_ENV_ID'
const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${DYNAMIC_ENV_ID}/.well-known/jwks`

// Initialize JWKS client with caching
const jwksClient = new JwksClient({
  jwksUri: jwksUrl,
  rateLimit: true,
  cache: true,
  cacheMaxEntries: 5,  // Maximum number of cached keys
  cacheMaxAge: 600000  // Cache duration in milliseconds (10 minutes)
})

// Helper function to get public key
async function getPublicKey(): Promise<string> {
  const signingKey = await jwksClient.getSigningKey()
  return signingKey.getPublicKey()
}

// Validate JWT token
export async function validateJWT(token: string): Promise<JwtPayload> {
  try {
    const publicKey = await getPublicKey()
    const decodedToken = jwt.verify(token, publicKey, {
      ignoreExpiration: false,
    }) as JwtPayload

    // Check for additional auth requirements
    if (decodedToken.scopes && decodedToken.scopes.includes('requiresAdditionalAuth')) {
      throw new Error('Additional verification required (e.g., MFA)')
    }

    return decodedToken
  } catch (error) {
    throw error
  }
}

// Extract token from Authorization header
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  return authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader
}
