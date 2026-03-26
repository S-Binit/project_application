const User = require('../models/user')
const Driver = require('../models/driver')
const Admin = require('../models/admin')
const Feedback = require('../models/feedback')
const Bill = require('../models/bill')
const Payment = require('../models/payment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const PasswordResetToken = require('../models/passwordResetToken')
const { broadcastSharedDrivers } = require('../utils/locationPresence')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9]{10}$/
const MIN_PASSWORD_LENGTH = 6
const TOKEN_EXPIRY = '7d'

const generateToken = (id, role) => 
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })

const validateEmail = (email) => EMAIL_REGEX.test(email)
const validatePhone = (phoneNumber) => PHONE_REGEX.test(phoneNumber)

const validatePassword = (password) => password && password.length >= MIN_PASSWORD_LENGTH

const getResetPasswordBaseUrl = (req) => {
  const configured = process.env.RESET_PASSWORD_BASE_URL
  const fallback = `${req.protocol}://${req.get('host')}`

  if (!configured) {
    return fallback
  }

  const normalized = configured.replace(/\/$/, '')
  const isLocalOnly = /localhost|127\.0\.0\.1/i.test(normalized)
  const requestIsLocalOnly = /localhost|127\.0\.0\.1/i.test(fallback)

  if (isLocalOnly && !requestIsLocalOnly) {
    return fallback
  }

  return normalized
}

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const findValidResetToken = (token) =>
  PasswordResetToken.findOne({
    token,
    expiresAt: { $gt: new Date() },
  })

const createMailTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

const sendResetPasswordEmail = async ({ to, resetLink }) => {
  const transporter = createMailTransporter()
  if (!transporter) {
    throw new Error('SMTP configuration is missing')
  }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: 'Password reset request',
    text: `You requested a password reset. Open this link to continue: ${resetLink}`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body

    // Validation
    if (!name?.trim() || !email?.trim() || !password || !phoneNumber?.trim()) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    const normalizedPhoneNumber = phoneNumber.replace(/\s+/g, '')
    if (!validatePhone(normalizedPhoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' })
    }

    // Check if user exists
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPhoneNumber = await bcrypt.hash(normalizedPhoneNumber, 10)
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      phoneHash: hashedPhoneNumber,
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

exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    const user = await User.findOne({ email, role: 'user' })

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      await PasswordResetToken.deleteMany({ userId: user._id })

      await PasswordResetToken.create({
        token,
        userId: user._id,
        expiresAt,
      })

      const resetLink = `${getResetPasswordBaseUrl(req)}/api/auth/reset-password/${token}`
      await sendResetPasswordEmail({ to: user.email, resetLink })
    }

    return res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error.message)
    if (error?.responseCode === 535) {
      return res.status(500).json({ message: 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS.' })
    }
    return res.status(500).json({ message: 'Failed to process forgot password request' })
  }
}

exports.verifyResetToken = async (req, res) => {
  try {
    const token = String(req.params?.token || '').trim()
    if (!token) {
      return res.status(400).json({ message: 'Token is required' })
    }

    const resetToken = await findValidResetToken(token).lean()

    if (!resetToken) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' })
    }

    return res.json({ success: true, message: 'Reset token is valid' })
  } catch (error) {
    console.error('Verify reset token error:', error.message)
    return res.status(500).json({ message: 'Failed to verify reset token' })
  }
}

exports.renderResetPasswordPage = async (req, res) => {
  try {
    const token = String(req.params?.token || '').trim()
    const resetToken = token ? await findValidResetToken(token).lean() : null

    if (!resetToken) {
      return res.status(400).send(`<!doctype html>
<html>
  <head><title>Reset Password</title></head>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <h2>Reset link invalid or expired</h2>
    <p>Please request a new password reset link from the app.</p>
  </body>
</html>`)
    }

    return res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Password</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 24px; max-width: 420px; margin: 0 auto;">
    <h2>Reset Password</h2>
    <form method="post" action="/api/auth/reset-password/${escapeHtml(token)}/web">
      <label for="newPassword">New password</label>
      <input id="newPassword" name="newPassword" type="password" minlength="6" required style="display:block;width:100%;padding:10px;margin:8px 0 16px;box-sizing:border-box;"/>
      <button type="submit" style="padding:10px 14px;background:#43A047;color:#fff;border:none;border-radius:6px;cursor:pointer;">Update Password</button>
    </form>
  </body>
</html>`)
  } catch (error) {
    console.error('Render reset page error:', error.message)
    return res.status(500).send('Failed to load reset page')
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.params?.token || '').trim()
    const newPassword = String(req.body?.newPassword || '')

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' })
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    const resetToken = await findValidResetToken(token)

    if (!resetToken) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' })
    }

    const user = await User.findById(resetToken.userId)
    if (!user) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await PasswordResetToken.deleteMany({ userId: user._id })

    return res.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error.message)
    return res.status(500).json({ message: 'Failed to reset password' })
  }
}

exports.resetPasswordFromForm = async (req, res) => {
  try {
    const token = String(req.params?.token || '').trim()
    const newPassword = String(req.body?.newPassword || '')

    if (!token || !newPassword) {
      return res.status(400).send('Token and new password are required')
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).send(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    const resetToken = await findValidResetToken(token)
    if (!resetToken) {
      return res.status(400).send('Reset token is invalid or expired')
    }

    const user = await User.findById(resetToken.userId)
    if (!user) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      return res.status(404).send('User not found')
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    await PasswordResetToken.deleteMany({ userId: user._id })

    return res.send(`<!doctype html>
<html>
  <head><title>Password Updated</title></head>
  <body style="font-family: Arial, sans-serif; padding: 24px;">
    <h2>Password updated successfully</h2>
    <p>You can now return to the app and login with your new password.</p>
  </body>
</html>`)
  } catch (error) {
    console.error('Reset password form error:', error.message)
    return res.status(500).send('Failed to reset password')
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

    driver.isLoggedIn = true
    driver.isOnline = true
    await driver.save()

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

exports.driverLogout = async (req, res) => {
  try {
    const driverId = req.user?.id
    if (!driverId) {
      return res.status(400).json({ message: 'Driver identity missing' })
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        sharingLocation: false,
        isLoggedIn: false,
        isOnline: false,
      },
      { new: true }
    )

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    const io = req.app.get('io')
    try {
      await broadcastSharedDrivers(io)
    } catch (emitError) {
      console.error('Socket broadcast error:', emitError.message)
    }

    return res.json({ success: true, message: 'Driver logged out successfully' })
  } catch (error) {
    console.error('Driver logout error:', error.message)
    return res.status(500).json({ message: 'Logout failed' })
  }
}

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(admin._id, 'admin')

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Admin login error:', error.message)
    res.status(500).json({ message: 'Login failed' })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' })
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' })
    }

    const roleToModel = {
      user: User,
      driver: Driver,
      admin: Admin,
    }

    const Model = roleToModel[req.user?.role]
    if (!Model) {
      return res.status(400).json({ message: 'Unsupported user role' })
    }

    const account = await Model.findById(req.user.id)
    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    account.password = await bcrypt.hash(newPassword, 10)
    await account.save()

    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error.message)
    res.status(500).json({ message: 'Password change failed' })
  }
}

exports.deleteOwnAccount = async (req, res) => {
  try {
    const { id, role } = req.user || {}

    if (!id || role !== 'user') {
      return res.status(403).json({ message: 'Only user accounts can be deleted here' })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'Account not found' })
    }

    await Promise.all([
      Feedback.deleteMany({ userId: id }),
      Payment.deleteMany({ userId: id }),
      Bill.deleteMany({ userId: id }),
    ])

    await User.findByIdAndDelete(id)

    res.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error.message)
    res.status(500).json({ message: 'Failed to delete account' })
  }
}

