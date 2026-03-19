const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
	initiatePayment,
	renderEsewaForm,
	paymentSuccessPage,
	paymentFailurePage,
	getMyBill,
	getPaymentHistory,
	getAdminPaidUsers,
	getAdminMonthlyBillSettings,
	updateAdminMonthlyBillSettings,
} = require('../controllers/payment.controller')

router.get('/esewa/form', renderEsewaForm)
router.get('/callback/success', paymentSuccessPage)
router.get('/callback/failure', paymentFailurePage)
router.get('/my-bill', authorize(['user']), getMyBill)
router.get('/history', authorize(['user']), getPaymentHistory)
router.get('/admin/paid-users', authorize(['admin']), getAdminPaidUsers)
router.get('/admin/monthly-bill', authorize(['admin']), getAdminMonthlyBillSettings)
router.post('/admin/monthly-bill', authorize(['admin']), updateAdminMonthlyBillSettings)
router.post('/initiate', authorize(['user']), initiatePayment)

module.exports = router
