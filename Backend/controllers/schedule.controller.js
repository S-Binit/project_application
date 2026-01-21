const fs = require('fs')
const path = require('path')
const Schedule = require('../models/schedule')
const Admin = require('../models/admin')

exports.uploadSchedule = async (req, res) => {
  try {
    const adminId = req.user.id
    const { description } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' })
    }

    const admin = await Admin.findById(adminId)
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    const fileName = req.file.filename
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`

    const schedule = await Schedule.create({
      imageUrl,
      imagePublicId: fileName,
      uploadedBy: adminId,
      uploadedByName: admin.name,
      description: description || '',
    })

    res.status(201).json({
      success: true,
      message: 'Schedule uploaded successfully',
      schedule,
    })
  } catch (error) {
    console.error('Upload schedule error:', error.message)
    res.status(500).json({ message: 'Failed to upload schedule' })
  }
}

exports.getSchedule = async (_req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 })

    res.json({
      success: true,
      schedules,
    })
  } catch (error) {
    console.error('Get schedule error:', error.message)
    res.status(500).json({ message: 'Failed to fetch schedule' })
  }
}

exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params

    if (!scheduleId) {
      return res.status(400).json({ message: 'Schedule ID is required' })
    }

    const schedule = await Schedule.findById(scheduleId)

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' })
    }

    // Remove file from disk if present
    const fileName = schedule.imagePublicId || path.basename(schedule.imageUrl || '')
    if (fileName) {
      const filePath = path.join(__dirname, '..', 'uploads', fileName)
      fs.unlink(filePath, () => {})
    }

    await Schedule.findByIdAndDelete(scheduleId)

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    })
  } catch (error) {
    console.error('Delete schedule error:', error.message)
    res.status(500).json({ message: 'Failed to delete schedule' })
  }
}
