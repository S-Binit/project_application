const Driver = require('../models/driver')

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

exports.getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params
    const driver = await Driver.findById(driverId).lean()

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    if (!driver.sharingLocation) {
      return res.json({ sharing: false, driverId })
    }

    const [longitude, latitude] = driver.location?.coordinates || []
    res.json({
      sharing: true,
      driverId,
      location: { latitude, longitude },
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('Get driver location error:', error.message)
    res.status(500).json({ message: 'Failed to fetch driver location' })
  }
}

exports.getLatestSharedLocation = async (_req, res) => {
  try {
    const driver = await Driver.findOne({ sharingLocation: true })
      .sort({ lastLocationAt: -1 })
      .lean()

    if (!driver) {
      return res.json({ sharing: false })
    }

    res.json(mapDriverToResponse(driver))
  } catch (error) {
    console.error('Get latest location error:', error.message)
    res.status(500).json({ message: 'Failed to fetch location' })
  }
}

exports.getAllSharedLocations = async (_req, res) => {
  try {
    const drivers = await Driver.find({ sharingLocation: true })
      .select(['_id', 'name', 'location', 'lastLocationAt', 'sharingLocation'])
      .sort({ lastLocationAt: -1 })
      .lean()

    const mapped = drivers
      .filter(d => d.sharingLocation && d.location?.coordinates && !isDefaultCoordinate(d.location.coordinates))
      .map(mapDriverToResponse)

    res.json({ sharing: mapped.length > 0, drivers: mapped })
  } catch (error) {
    console.error('Get all shared locations error:', error.message)
    res.status(500).json({ message: 'Failed to fetch locations' })
  }
}
