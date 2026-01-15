const express = require('express')
const router = express.Router()
const { register, userLogin, driverLogin, adminLogin } = require('../controllers/auth.controller')

router.post('/register', register)
router.post('/login', userLogin)
router.post('/driver/login', driverLogin)
router.post('/admin/login', adminLogin)

module.exports = router
