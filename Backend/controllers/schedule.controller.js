const Schedule = require('../models/schedule')
const Admin = require('../models/admin')

exports.uploadSchedule = async (req, res) => {
  try {
    const adminId = req.user.id
    const { imageUrl, imagePublicId, description } = req.body

    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'Image URL and public ID are required' })
    }

    const admin = await Admin.findById(adminId)
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    // Create new schedule image
    const schedule = await Schedule.create({
      imageUrl,
      imagePublicId,
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

exports.getSchedule = async (req, res) => {
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
