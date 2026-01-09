const User = require('../models/user')
const Driver = require('../models/driver')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const TOKEN_EXPIRY = '7d'

const generateToken = (id, role) => 
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })

const validateEmail = (email) => EMAIL_REGEX.test(email)

const validatePassword = (password) => password && password.length >= MIN_PASSWORD_LENGTH

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    // Check if user exists
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      role: 'user' 
    })

    const token = generateToken(user._id, user.role)

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ message: 'Registration failed' })
  }
}

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'user' })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id, user.role)

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('User login error:', error.message)
    res.status(500).json({ message: 'Login failed' })
  }
}

exports.driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const driver = await Driver.findOne({ email: email.toLowerCase() })
    if (!driver || !(await bcrypt.compare(password, driver.password))) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(driver._id, 'driver')

    res.json({
      success: true,
      token,
      user: { 
        id: driver._id, 
        name: driver.name, 
        email: driver.email, 
        role: 'driver',
        phoneNumber: driver.phoneNumber,
        vehicleType: driver.vehicleType,
        licenseNumber: driver.licenseNumber,
      },
    })
  } catch (error) {
    console.error('Driver login error:', error.message)
    res.status(500).json({ message: 'Login failed' })
  }
}

