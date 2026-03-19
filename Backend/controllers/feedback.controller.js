const Feedback = require('../models/feedback')
const User = require('../models/user')

exports.submitFeedback = async (req, res) => {
  try {
    const {
      type,
      subject,
      message,
      rating,
      complaintCategory,
      isMissedPickup,
      latitude,
      longitude,
      address,
    } = req.body
    const userId = req.user.id

    const missedPickup = isMissedPickup === true || isMissedPickup === 'true' || complaintCategory === 'missed_pickup'

    const trimmedSubject = subject?.trim() || (missedPickup ? 'Missed pickup in my area' : '')
    const trimmedMessage = message?.trim() || (missedPickup ? 'Driver missed pickup in my area.' : '')

    // Validation
    if (!type || !trimmedSubject || !trimmedMessage) {
      return res.status(400).json({ message: 'Type, subject, and message are required' })
    }

    if (!['complaint', 'feedback'].includes(type)) {
      return res.status(400).json({ message: 'Type must be complaint or feedback' })
    }

    // Get user data
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const parsedLatitude = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null
    const parsedLongitude = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null

    const hasValidCoordinates =
      Number.isFinite(parsedLatitude) && parsedLatitude >= -90 && parsedLatitude <= 90 &&
      Number.isFinite(parsedLongitude) && parsedLongitude >= -180 && parsedLongitude <= 180

    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      type,
      subject: trimmedSubject,
      message: trimmedMessage,
      complaintCategory: missedPickup ? 'missed_pickup' : 'general',
      priority: missedPickup ? 'high' : 'normal',
      isMissedPickup: missedPickup,
      location: hasValidCoordinates
        ? {
            latitude: parsedLatitude,
            longitude: parsedLongitude,
            address: address?.trim?.() || '',
          }
        : undefined,
      photoUrl: imageUrl || undefined,
      photoPublicId: req.file?.filename || undefined,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
    })

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    })
  } catch (error) {
    console.error('Submit feedback error:', error.message)
    res.status(500).json({ message: 'Failed to submit feedback' })
  }
}

exports.getFeedback = async (req, res) => {
  try {
    const userId = req.user.id

    const feedbacks = await Feedback.find({ userId, deletedByUser: false }).sort({ createdAt: -1 })

    res.json({
      success: true,
      feedbacks,
    })
  } catch (error) {
    console.error('Get feedback error:', error.message)
    res.status(500).json({ message: 'Failed to fetch feedback' })
  }
}

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ deletedByAdmin: false }).sort({ createdAt: -1 })

    const sortedFeedbacks = feedbacks.sort((a, b) => {
      const aPriority = a.priority === 'high' ? 1 : 0
      const bPriority = b.priority === 'high' ? 1 : 0
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    res.json({
      success: true,
      feedbacks: sortedFeedbacks,
    })
  } catch (error) {
    console.error('Get all feedback error:', error.message)
    res.status(500).json({ message: 'Failed to fetch feedback' })
  }
}

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params
    const { status, adminResponse } = req.body

    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status, adminResponse: adminResponse || undefined },
      { new: true }
    )

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    res.json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error('Update feedback error:', error.message)
    res.status(500).json({ message: 'Failed to update feedback' })
  }
}

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    const feedback = await Feedback.findById(feedbackId)

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    // Users can only delete their own feedback, admins can delete any
    if (userRole !== 'admin' && feedback.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' })
    }

    // Mark as deleted for the appropriate role
    if (userRole === 'admin') {
      feedback.deletedByAdmin = true
    } else {
      feedback.deletedByUser = true
    }

    // If both user and admin have deleted, remove the record completely
    if (feedback.deletedByUser && feedback.deletedByAdmin) {
      await Feedback.findByIdAndDelete(feedbackId)
    } else {
      await feedback.save()
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    })
  } catch (error) {
    console.error('Delete feedback error:', error.message)
    res.status(500).json({ message: 'Failed to delete feedback' })
  }
}
