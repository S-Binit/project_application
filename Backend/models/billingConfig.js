const mongoose = require('mongoose')

const billingConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      trim: true,
    },
    monthlyAmount: {
      type: Number,
      required: true,
      min: 1,
      default: 750,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('BillingConfig', billingConfigSchema)
