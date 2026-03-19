const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['complaint', 'feedback'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    complaintCategory: {
      type: String,
      enum: ['general', 'missed_pickup'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'normal',
    },
    isMissedPickup: {
      type: Boolean,
      default: false,
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      address: {
        type: String,
      },
    },
    photoUrl: {
      type: String,
    },
    photoPublicId: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminResponse: {
      type: String,
    },
    deletedByUser: {
      type: Boolean,
      default: false,
    },
    deletedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Feedback', feedbackSchema)
