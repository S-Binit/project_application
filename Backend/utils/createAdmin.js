require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

async function createAdmins() {
  try {
    const adminData = [
      {
        name: 'Primary Admin',
        email: 'admin1@example.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Backup Admin',
        email: 'admin2@example.com',
        password: 'admin456',
        role: 'admin',
      },
    ]

    for (const data of adminData) {
      const existing = await Admin.findOne({ email: data.email.toLowerCase() })
      if (existing) {
        console.log(`Admin ${data.email} already exists, skipping...`)
        continue
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const admin = await Admin.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
      })

      console.log('Admin created:', {
        name: admin.name,
        email: admin.email,
        password: data.password,
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createAdmins()
