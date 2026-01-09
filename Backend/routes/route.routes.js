const express = require('express')
const router = express.Router()
const { geocodeLocation, calculateRoute } = require('../controllers/route.controller')

router.get('/geocode', geocodeLocation)
router.get('/calculate', calculateRoute)

module.exports = router
