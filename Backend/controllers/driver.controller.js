const Driver = require('../models/driver')
const bcrypt = require('bcryptjs')

exports.createDriver = async (req, res) => {
  try {
    const { email, password, name, licenseNumber, licenseExpiry, vehicleNumber, vehicleModel, phoneNumber } = req.body

    // Validation
    if (!email?.trim() || !password?.trim() || !name?.trim() || !licenseNumber?.trim() || 
        !licenseExpiry || !vehicleNumber?.trim() || !vehicleModel?.trim() || !phoneNumber?.trim()) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [
        { email: email.toLowerCase() },
        { licenseNumber: licenseNumber.trim() },
        { vehicleNumber: vehicleNumber.trim() }
      ]
    })

    if (existingDriver) {
      if (existingDriver.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      if (existingDriver.licenseNumber === licenseNumber.trim()) {
        return res.status(400).json({ message: 'License number already exists' })
      }
      if (existingDriver.vehicleNumber === vehicleNumber.trim()) {
        return res.status(400).json({ message: 'Vehicle number already exists' })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create driver
    const driver = await Driver.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseExpiry: new Date(licenseExpiry),
      vehicleNumber: vehicleNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      phoneNumber: phoneNumber.trim(),
    })

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver: {
        id: driver._id,
        email: driver.email,
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        vehicleNumber: driver.vehicleNumber,
      },
    })
  } catch (error) {
    console.error('Create driver error:', error.message)
    res.status(500).json({ message: 'Failed to create driver' })
  }
}

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').sort({ createdAt: -1 })

    res.json({
      success: true,
      drivers,
    })
  } catch (error) {
    console.error('Get drivers error:', error.message)
    res.status(500).json({ message: 'Failed to fetch drivers' })
  }
}

exports.getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params

    const driver = await Driver.findById(driverId).select('-password')

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    res.json({
      success: true,
      driver,
    })
  } catch (error) {
    console.error('Get driver error:', error.message)
    res.status(500).json({ message: 'Failed to fetch driver' })
  }
}

exports.deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params

    const driver = await Driver.findByIdAndDelete(driverId)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully',
    })
  } catch (error) {
    console.error('Delete driver error:', error.message)
    res.status(500).json({ message: 'Failed to delete driver' })
  }
}
