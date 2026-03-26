const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
	register,
	userLogin,
	forgotPassword,
	renderResetPasswordPage,
	verifyResetToken,
	resetPassword,
	resetPasswordFromForm,
	driverLogin,
	adminLogin,
	driverLogout,
	changePassword,
	deleteOwnAccount,
} = require('../controllers/auth.controller')

router.post('/register', register)
router.post('/login', userLogin)
router.post('/forgot-password', forgotPassword)
router.get('/reset-password/:token', renderResetPasswordPage)
router.get('/reset-password/:token/verify', verifyResetToken)
router.post('/reset-password/:token', resetPassword)
router.post('/reset-password/:token/web', resetPasswordFromForm)
router.post('/driver/login', driverLogin)
router.post('/driver/logout', authorize(['driver']), driverLogout)
router.post('/admin/login', adminLogin)
router.post('/change-password', authorize(), changePassword)
router.delete('/me', authorize(['user']), deleteOwnAccount)

module.exports = router
