const mongoose = require('mongoose')

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    billingMonth: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 750,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

billSchema.index({ userId: 1, billingMonth: 1 }, { unique: true })

module.exports = mongoose.model('Bill', billSchema)
