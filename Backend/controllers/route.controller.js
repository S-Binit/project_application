const axios = require('axios')

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const OSRM_BASE = 'https://router.project-osrm.org/route/v1'

exports.geocodeLocation = async (req, res) => {
  try {
    const { location } = req.query

    if (!location?.trim()) {
      return res.status(400).json({ message: 'Location is required' })
    }

    const response = await axios.get(`${NOMINATIM_BASE}/search`, {
      params: {
        q: location,
        format: 'json',
        limit: 5,
        countrycodes: 'np', // Restrict suggestions to Nepal
      },
      headers: {
        'User-Agent': 'project-app/1.0',
      },
      timeout: 5000,
    })

    if (response.data && response.data.length > 0) {
      const locations = response.data.map((result) => ({
        id: result.place_id,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        name: result.display_name,
      }))

      return res.json({
        success: true,
        locations,
      })
    }

    res.json({ success: false, message: 'Location not found' })
  } catch (error) {
    console.error('Geocoding error:', error.message)
    res.status(500).json({ message: 'Failed to geocode location' })
  }
}

exports.calculateRoute = async (req, res) => {
  try {
    const { startLat, startLon, endLat, endLon } = req.query

    if (!startLat || !startLon || !endLat || !endLon) {
      return res.status(400).json({ message: 'All coordinates are required' })
    }

    const coordinates = `${startLon},${startLat};${endLon},${endLat}`
    const url = `${OSRM_BASE}/driving/${coordinates}`

    const response = await axios.get(url, {
      params: {
        geometries: 'geojson',
        steps: false,
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'project-app/1.0',
      },
    })

    if (response.data.code === 'Ok' && response.data.routes && response.data.routes[0]) {
      const route = response.data.routes[0]
      const routeCoordinates = route.geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }))

      return res.json({
        success: true,
        route: {
          coordinates: routeCoordinates,
          distance: Math.round(route.distance / 1000), // km
          duration: Math.round(route.duration / 60), // minutes
        },
      })
    }

    res.json({ success: false, message: 'Route not found or unreachable' })
  } catch (error) {
    console.error('Route calculation error:', error.message)
    res.status(500).json({ message: 'Failed to calculate route: ' + error.message })
  }
}
