const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const { register, userLogin, driverLogin, adminLogin, changePassword, deleteOwnAccount } = require('../controllers/auth.controller')

router.post('/register', register)
router.post('/login', userLogin)
router.post('/driver/login', driverLogin)
router.post('/admin/login', adminLogin)
router.post('/change-password', authorize(), changePassword)
router.delete('/me', authorize(['user']), deleteOwnAccount)

module.exports = router
