require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const connectDB = require('./config/db')
const Driver = require('./models/driver')
const { broadcastSharedDrivers } = require('./utils/locationPresence')

const app = express()
const server = http.createServer(app)

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

const driverSocketCounts = new Map()

const setDriverPresence = async ({ driverId, isOnline }) => {
  if (!driverId) return

  const update = { isOnline }
  if (isOnline) {
    update.isLoggedIn = true
  }

  await Driver.findByIdAndUpdate(driverId, update)
}

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
  const isDriver = socket.user?.role === 'driver'
  const driverId = isDriver ? String(socket.user.id) : null

  if (driverId) {
    const current = driverSocketCounts.get(driverId) || 0
    driverSocketCounts.set(driverId, current + 1)

    setDriverPresence({ driverId, isOnline: true })
      .then(() => broadcastSharedDrivers(io))
      .catch((error) => console.error('Driver connect presence error:', error.message))
  }

  socket.on('disconnect', () => {
    if (!driverId) return

    const current = driverSocketCounts.get(driverId) || 0
    const next = Math.max(0, current - 1)

    if (next > 0) {
      driverSocketCounts.set(driverId, next)
      return
    }

    driverSocketCounts.delete(driverId)

    setDriverPresence({ driverId, isOnline: false })
      .then(() => broadcastSharedDrivers(io))
      .catch((error) => console.error('Driver disconnect presence error:', error.message))
  })
})

app.set('io', io)

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => 
  console.log(`Server running on port ${PORT}`)
)
