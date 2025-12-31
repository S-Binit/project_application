const Driver = require('../models/driver')

const isValidCoordinate = (value, min, max) => typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max

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

    const update = {
      sharingLocation: Boolean(sharing),
      lastLocationAt: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    }

    const driver = await Driver.findByIdAndUpdate(driverId, update, {
      new: true,
      runValidators: true,
    })

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    return res.json({
      success: true,
      sharing: driver.sharingLocation,
      driverId: driver._id,
      location: {
        latitude,
        longitude,
      },
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('shareLocation error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params
    const driver = await Driver.findById(driverId).lean()
    if (!driver) return res.status(404).json({ message: 'Driver not found' })

    if (!driver.sharingLocation) {
      return res.json({ sharing: false, driverId })
    }

    const [longitude, latitude] = driver.location?.coordinates || []
    return res.json({
      sharing: true,
      driverId,
      location: { latitude, longitude },
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('getDriverLocation error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getLatestSharedLocation = async (_req, res) => {
  try {
    const driver = await Driver.findOne({ sharingLocation: true })
      .sort({ lastLocationAt: -1 })
      .lean()

    if (!driver) return res.json({ sharing: false })

    const [longitude, latitude] = driver.location?.coordinates || []
    return res.json({
      sharing: true,
      driverId: driver._id,
      location: { latitude, longitude },
      updatedAt: driver.lastLocationAt,
    })
  } catch (error) {
    console.error('getLatestSharedLocation error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getAllSharedLocations = async (_req, res) => {
  try {
    const drivers = await Driver.find({ sharingLocation: true })
      .select(['_id', 'name', 'location', 'lastLocationAt'])
      .sort({ lastLocationAt: -1 })
      .lean()

    const mapped = drivers
      .map(d => {
        const [longitude, latitude] = d.location?.coordinates || []
        if (latitude === undefined || longitude === undefined) return null
        return {
          driverId: d._id,
          name: d.name,
          location: { latitude, longitude },
          updatedAt: d.lastLocationAt,
        }
      })
      .filter(Boolean)

    return res.json({ sharing: mapped.length > 0, drivers: mapped })
  } catch (error) {
    console.error('getAllSharedLocations error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}
