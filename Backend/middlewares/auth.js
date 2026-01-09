const jwt = require('jsonwebtoken')

module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ message: 'Authorization token required' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' })
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }
}
