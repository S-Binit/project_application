const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const { submitFeedback, getFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedback.controller')

// User routes
router.post('/submit', authorize(['user']), submitFeedback)
router.get('/my', authorize(['user']), getFeedback)

// Admin routes
router.get('/all', authorize(['admin']), getAllFeedback)
router.patch('/:feedbackId', authorize(['admin']), updateFeedbackStatus)

module.exports = router
