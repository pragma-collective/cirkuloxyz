import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { validateJWT, extractToken } from '../lib/auth'

const auth = new Hono()

// Validate JWT endpoint
auth.get('/validate', async (c) => {
  try {
    // Get Authorization header
    const authHeader = c.req.header('Authorization')
    const token = extractToken(authHeader)
    
    if (!token) {
      return c.json({ error: 'Authorization header missing or invalid' }, 401)
    }

    // Validate the JWT
    const decodedToken = await validateJWT(token)

    // Return decoded token directly
    return c.json(decodedToken)

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: 'Invalid token', details: error.message }, 401)
    }
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: 'Token expired', details: error.message }, 401)
    }
    return c.json({ 
      error: 'Authentication failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 401)
  }
})

export default auth
