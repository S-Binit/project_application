const Feedback = require('../models/feedback')
const User = require('../models/user')

exports.submitFeedback = async (req, res) => {
  try {
    const { type, subject, message, rating } = req.body
    const userId = req.user.id

    // Validation
    if (!type || !subject?.trim() || !message?.trim()) {
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

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      type,
      subject: subject.trim(),
      message: message.trim(),
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

    res.json({
      success: true,
      feedbacks,
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
