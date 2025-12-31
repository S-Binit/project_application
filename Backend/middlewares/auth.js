const jwt = require('jsonwebtoken')

// Simple JWT auth middleware with optional role checking
module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || ''
      const [, token] = header.split(' ')
      if (!token) {
        return res.status(401).json({ message: 'Authorization token required' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded

      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!decoded.role || !allowedRoles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Forbidden: insufficient role' })
        }
      }

      next()
    } catch (err) {
      console.error('Auth middleware error:', err)
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }
}
