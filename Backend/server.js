require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const connectDB = require('./config/db')

const app = express()
const server = http.createServer(app)

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
app.use('/api/payment', require('./routes/payment.routes'))

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.use((socket, next) => {
  const token = socket.handshake?.auth?.token
  if (!token) {
    return next()
  }

  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (_error) {
    next(new Error('Unauthorized socket connection'))
  }
})

io.on('connection', (socket) => {
  socket.on('disconnect', () => {})
})

app.set('io', io)

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => 
  console.log(`Server running on port ${PORT}`)
)
