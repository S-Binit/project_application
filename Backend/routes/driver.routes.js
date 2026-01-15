const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const { createDriver, getAllDrivers, getDriverById, deleteDriver } = require('../controllers/driver.controller')

// Admin only routes
router.post('/create', authorize(['admin']), createDriver)
router.get('/all', authorize(['admin']), getAllDrivers)
router.get('/:driverId', authorize(['admin']), getDriverById)
router.delete('/:driverId', authorize(['admin']), deleteDriver)

module.exports = router
