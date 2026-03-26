const Driver = require('../models/driver')

const isDefaultCoordinate = (coords = []) =>
  Array.isArray(coords) && coords[0] === 0 && coords[1] === 0

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

const getVisibleSharedDrivers = async () => {
  const drivers = await Driver.find({
    sharingLocation: true,
    isLoggedIn: true,
    isOnline: true,
  })
    .select([
      '_id',
      'name',
      'location',
      'lastLocationAt',
      'sharingLocation',
      'isLoggedIn',
      'isOnline',
    ])
    .sort({ lastLocationAt: -1 })
    .lean()

  return drivers
    .filter((d) => d.location?.coordinates && !isDefaultCoordinate(d.location.coordinates))
    .map(mapDriverToResponse)
}

const broadcastSharedDrivers = async (io) => {
  if (!io) return
  const mapped = await getVisibleSharedDrivers()
  io.emit('drivers:update', { sharing: mapped.length > 0, drivers: mapped })
}

module.exports = {
  isDefaultCoordinate,
  mapDriverToResponse,
  getVisibleSharedDrivers,
  broadcastSharedDrivers,
}
