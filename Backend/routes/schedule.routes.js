const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
  uploadSchedule,
  getSchedule,
  deleteSchedule,
} = require('../controllers/schedule.controller')

router.post('/upload', authorize(['admin']), uploadSchedule)
router.get('/', getSchedule)
router.delete('/:scheduleId', authorize(['admin']), deleteSchedule)

module.exports = router
