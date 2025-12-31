const express = require('express')
const router = express.Router()

const authorize = require('../middlewares/auth')
const {
  shareLocation,
  getDriverLocation,
  getLatestSharedLocation,
  getAllSharedLocations,
} = require('../controllers/location.controller')

// Driver shares/updates location (requires driver token)
router.post('/share', authorize(['driver']), shareLocation)

// Anyone can fetch latest shared location (for user app)
router.get('/latest', getLatestSharedLocation)

// Anyone can fetch all currently sharing drivers
router.get('/shared', getAllSharedLocations)

// Fetch specific driver location (optional)
router.get('/:driverId', getDriverLocation)

module.exports = router
