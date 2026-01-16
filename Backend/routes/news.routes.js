const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/auth')
const {
  uploadNews,
  getNews,
  deleteNews,
} = require('../controllers/news.controller')

router.post('/upload', authorize(['admin']), uploadNews)
router.get('/', getNews)
router.delete('/:newsId', authorize(['admin']), deleteNews)

module.exports = router
