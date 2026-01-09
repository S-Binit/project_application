const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
  shareLocation,
  getDriverLocation,
  getLatestSharedLocation,
  getAllSharedLocations,
} = require('../controllers/location.controller')

router.post('/share', authorize(['driver']), shareLocation)
router.get('/latest', getLatestSharedLocation)
router.get('/shared', getAllSharedLocations)
router.get('/:driverId', getDriverLocation)

module.exports = router
