require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/location', require('./routes/location.routes'))
app.use('/api/route', require('./routes/route.routes'))
app.use('/api/feedback', require('./routes/feedback.routes'))
app.use('/api/driver', require('./routes/driver.routes'))
app.use('/api/schedule', require('./routes/schedule.routes'))
app.use('/api/news', require('./routes/news.routes'))

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => 
  console.log(`Server running on port ${PORT}`)
)
