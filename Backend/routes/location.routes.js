const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
  shareLocation,
  getDriverLocation,
  getAllSharedLocations,
} = require('../controllers/location.controller')

router.post('/share', authorize(['driver']), shareLocation)
router.get('/shared', getAllSharedLocations)
router.get('/:driverId', getDriverLocation)

module.exports = router
