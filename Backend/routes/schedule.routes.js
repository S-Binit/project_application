const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const { uploadScheduleImage } = require('../middlewares/upload')
const {
  uploadSchedule,
  getSchedule,
  deleteSchedule,
} = require('../controllers/schedule.controller')

// Accept multipart form-data: field name "image"
router.post('/upload', authorize(['admin']), uploadScheduleImage.single('image'), uploadSchedule)
router.get('/', getSchedule)
router.delete('/:scheduleId', authorize(['admin']), deleteSchedule)

module.exports = router
