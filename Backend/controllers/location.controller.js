const Driver = require('../models/driver')
const axios = require('axios')

const OSRM_BASE = 'https://router.project-osrm.org/route/v1'

const isValidCoordinate = (value, min, max) => 
  typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max

const isDefaultCoordinate = (coords) => 
  coords[0] === 0 && coords[1] === 0

const mapDriverToResponse = (driver) => {
  const [longitude, latitude] = driver.location?.coordinates || []
  return {
    driverId: driver._id,
    name: driver.name,
    sharing: true,
    location: { latitude, longitude },
    updatedAt: driver.lastLocationAt,
  }
}

const getMappedSharedDrivers = async () => {
  const drivers = await Driver.find({ sharingLocation: true })
    .select(['_id', 'name', 'location', 'lastLocationAt', 'sharingLocation'])
    .sort({ lastLocationAt: -1 })
    .lean()

  return drivers
    .filter(d => d.sharingLocation && d.location?.coordinates && !isDefaultCoordinate(d.location.coordinates))
    .map(mapDriverToResponse)
}

exports.shareLocation = async (req, res) => {
  try {
    const driverId = req.user?.id
    const { latitude, longitude, sharing = true } = req.body || {}

    if (!driverId) {
      return res.status(400).json({ message: 'Driver identity missing' })
    }

    if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) {
      return res.status(400).json({ message: 'Invalid coordinates' })
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        sharingLocation: Boolean(sharing),
        lastLocationAt: new Date(),
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
      { new: true, runValidators: true }
    )

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    const io = req.app.get('io')
    if (io) {
      try {
        const mapped = await getMappedSharedDrivers()
        io.emit('drivers:update', { sharing: mapped.length > 0, drivers: mapped })
      } catch (emitError) {
        console.error('Socket broadcast error:', emitError.message)
      }
    }

    res.json({
      success: true,
      sharing: driver.sharingLocation,
      driverId: driver._id,
      location: { latitude, longitude },
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('Share location error:', error.message)
    res.status(500).json({ message: 'Failed to share location' })
  }
}

exports.getAllSharedLocations = async (_req, res) => {
  try {
    const mapped = await getMappedSharedDrivers()

    res.json({ sharing: mapped.length > 0, drivers: mapped })
  } catch (error) {
    console.error('Get all shared locations error:', error.message)
    res.status(500).json({ message: 'Failed to fetch locations' })
  }
}

exports.getDriverEta = async (req, res) => {
  try {
    const driverId = String(req.query.driverId || '').trim()
    const userLat = Number(req.query.userLat)
    const userLng = Number(req.query.userLng)

    if (!driverId) {
      return res.status(400).json({ message: 'driverId is required' })
    }

    if (!isValidCoordinate(userLat, -90, 90) || !isValidCoordinate(userLng, -180, 180)) {
      return res.status(400).json({ message: 'Invalid user coordinates' })
    }

    const driver = await Driver.findById(driverId)
      .select(['_id', 'name', 'location', 'sharingLocation', 'lastLocationAt'])
      .lean()

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    if (!driver.sharingLocation || !driver.location?.coordinates || isDefaultCoordinate(driver.location.coordinates)) {
      return res.status(400).json({ message: 'Driver is not actively sharing location' })
    }

    const [driverLng, driverLat] = driver.location.coordinates
    if (!isValidCoordinate(driverLat, -90, 90) || !isValidCoordinate(driverLng, -180, 180)) {
      return res.status(400).json({ message: 'Driver location is invalid' })
    }

    const coordinates = `${driverLng},${driverLat};${userLng},${userLat}`
    const url = `${OSRM_BASE}/driving/${coordinates}`

    const routeRes = await axios.get(url, {
      params: {
        steps: false,
        overview: false,
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'project-app/1.0',
      },
    })

    const route = routeRes.data?.routes?.[0]
    if (!route) {
      return res.status(404).json({ message: 'Unable to compute ETA for this route' })
    }

    const distanceMeters = Number(route.distance || 0)
    const durationSeconds = Number(route.duration || 0)
    const etaMinutes = Math.max(1, Math.round((durationSeconds / 60) * 1.1))

    return res.json({
      success: true,
      driverId: driver._id,
      driverName: driver.name,
      etaMinutes,
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('Get driver ETA error:', error.message)
    return res.status(500).json({ message: 'Failed to calculate ETA' })
  }
}
