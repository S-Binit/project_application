const axios = require('axios')
const crypto = require('crypto')
const Bill = require('../models/bill')
const Payment = require('../models/payment')
const BillingConfig = require('../models/billingConfig')

const FALLBACK_SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL || 'https://example.com/payment/success'
const FALLBACK_FAILURE_URL = process.env.PAYMENT_FAILURE_URL || 'https://example.com/payment/failure'
const ESEWA_TEST_SECRET_KEY = '8gBm/:&EnhH.1/q'
const DEFAULT_BILL_AMOUNT = Number(process.env.DEFAULT_BILL_AMOUNT || 750)

function resolveBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  const host = req.get('host')
  return `${protocol}://${host}`
}

function getBillingMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getDueDateForMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 25, 23, 59, 59, 999)
}

function getNextMonthDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

async function getConfiguredMonthlyAmount() {
  const config = await BillingConfig.findOneAndUpdate(
    { key: 'global' },
    {
      $setOnInsert: {
        monthlyAmount: DEFAULT_BILL_AMOUNT,
      },
    },
    { new: true, upsert: true }
  )

  const amount = Number(config?.monthlyAmount)
  return Number.isFinite(amount) && amount > 0 ? amount : DEFAULT_BILL_AMOUNT
}

async function ensureBillForMonth(userId, monthDate, amount) {
  const billingMonth = getBillingMonthLabel(monthDate)
  const dueDate = getDueDateForMonth(monthDate)
  const parsedAmount = Number(amount)
  const billAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
    ? parsedAmount
    : await getConfiguredMonthlyAmount()

  const bill = await Bill.findOneAndUpdate(
    { userId, billingMonth },
    {
      $setOnInsert: {
        amount: billAmount,
        dueDate,
        status: 'pending',
      },
    },
    { new: true, upsert: true }
  )

  return bill
}

async function ensureCurrentPendingBill(userId) {
  const existingPendingBill = await Bill.findOne({ userId, status: 'pending' }).sort({ dueDate: 1 })
  if (existingPendingBill) {
    return existingPendingBill
  }

  return ensureBillForMonth(userId, new Date())
}

async function createNextBill(userId, paidBill) {
  const baseDate = paidBill?.dueDate ? new Date(paidBill.dueDate) : new Date()
  const nextMonthDate = getNextMonthDate(baseDate)
  return ensureBillForMonth(userId, nextMonthDate)
}

function buildEsewaPayload({ amount, transactionId, successUrl, failureUrl }) {
  const baseUrl = process.env.ESEWA_BASE_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
  const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'
  const finalSuccessUrl = successUrl || process.env.ESEWA_SUCCESS_URL || FALLBACK_SUCCESS_URL
  const finalFailureUrl = failureUrl || process.env.ESEWA_FAILURE_URL || FALLBACK_FAILURE_URL
  const signingString = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`
  const rawEsewaSecretKey = (process.env.ESEWA_SECRET_KEY || '').trim()
  const looksLikePlaceholderEsewa = /^your[_-]/i.test(rawEsewaSecretKey) || /esewa_secret_key/i.test(rawEsewaSecretKey)
  const esewaSecretKey = !rawEsewaSecretKey || looksLikePlaceholderEsewa
    ? ESEWA_TEST_SECRET_KEY
    : rawEsewaSecretKey

  let signature = process.env.ESEWA_SIGNATURE || ''
  signature = crypto
    .createHmac('sha256', esewaSecretKey)
    .update(signingString)
    .digest('base64')

  return {
    baseUrl,
    amount: String(amount),
    tax_amount: '0',
    total_amount: String(amount),
    transaction_uuid: transactionId,
    product_code: productCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: finalSuccessUrl,
    failure_url: finalFailureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function buildKhaltiUrl({ amount, transactionId, websiteUrl, returnUrl }) {
  const rawKhaltiSecretKey = (
    process.env.KHALTI_SECRET_KEY ||
    process.env['KHALTI-SECRET-KEY'] ||
    ''
  ).trim()
  const khaltiSecretKey = rawKhaltiSecretKey.replace(/^Key\s+/i, '')
  const finalWebsiteUrl = websiteUrl || process.env.KHALTI_WEBSITE_URL || 'http://localhost:3000'
  const finalReturnUrl = returnUrl || process.env.KHALTI_RETURN_URL || FALLBACK_SUCCESS_URL

  if (!khaltiSecretKey) {
    throw new Error('KHALTI_SECRET_KEY is not configured on server')
  }

  const looksLikePlaceholder = /^your[_-]/i.test(khaltiSecretKey) || /khalti_secret_key/i.test(khaltiSecretKey)
  if (looksLikePlaceholder) {
    throw new Error('KHALTI_SECRET_KEY is still placeholder text in .env')
  }

  if (/public/i.test(khaltiSecretKey)) {
    throw new Error('KHALTI_SECRET_KEY looks like a public key. Use Khalti secret key.')
  }

  const payload = {
    return_url: finalReturnUrl,
    website_url: finalWebsiteUrl,
    amount: Number(amount) * 100,
    purchase_order_id: transactionId,
    purchase_order_name: 'Waste Collection Bill',
  }

  const response = await axios.post('https://dev.khalti.com/api/v2/epayment/initiate/', payload, {
    headers: {
      Authorization: `Key ${khaltiSecretKey}`,
      'Content-Type': 'application/json',
    },
  })

  return {
    paymentUrl: response.data?.payment_url,
  }
}

function parseEsewaCallbackData(req) {
  const paymentId = String(req.query.paymentId || '').trim()
  const queryTransactionId = String(req.query.transactionId || req.query.transaction_uuid || '').trim()

  if (!req.query.data) {
    return {
      paymentId,
      transactionId: queryTransactionId,
      payload: null,
    }
  }

  try {
    const decoded = Buffer.from(String(req.query.data), 'base64').toString('utf-8')
    const payload = JSON.parse(decoded)
    const payloadTransactionId = String(payload.transaction_uuid || '').trim()

    return {
      paymentId,
      transactionId: payloadTransactionId || queryTransactionId,
      payload,
    }
  } catch (_error) {
    return {
      paymentId,
      transactionId: queryTransactionId,
      payload: null,
    }
  }
}

exports.initiatePayment = async (req, res) => {
  try {
    const userId = req.user?.id
    const provider = String(req.body.provider || 'esewa').toLowerCase()

    if (!provider || !['khalti', 'esewa'].includes(provider)) {
      return res.status(400).json({ message: 'Provider must be khalti or esewa' })
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user' })
    }

    const bill = await ensureCurrentPendingBill(userId)
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const baseUrl = resolveBaseUrl(req)
    const successUrl = `${baseUrl}/api/payment/callback/success`
    const paymentRecord = await Payment.create({
      userId,
      billId: bill._id,
      provider,
      transactionId,
      amount: bill.amount,
      status: 'pending',
    })

    const esewaFormUrl = `${baseUrl}/api/payment/esewa/form?paymentId=${encodeURIComponent(paymentRecord._id.toString())}&transactionId=${encodeURIComponent(transactionId)}`

    if (provider === 'esewa') {
      return res.json({
        success: true,
        provider,
        transactionId,
        billId: bill._id,
        amount: bill.amount,
        paymentUrl: esewaFormUrl,
      })
    }

    const khaltiResponse = await buildKhaltiUrl({
      amount: bill.amount,
      transactionId,
      websiteUrl: baseUrl,
      returnUrl: `${successUrl}?transactionId=${encodeURIComponent(transactionId)}`,
    })

    if (!khaltiResponse.paymentUrl) {
      await Payment.findByIdAndUpdate(paymentRecord._id, { status: 'failed', failedAt: new Date() })
      return res.status(500).json({ message: 'Failed to generate Khalti payment URL' })
    }

    return res.json({
      success: true,
      provider,
      transactionId,
      billId: bill._id,
      amount: bill.amount,
      paymentUrl: khaltiResponse.paymentUrl,
    })
  } catch (error) {
    const providerMessage = error?.response?.data?.detail || error?.response?.data?.message
    let message = providerMessage || error.message || 'Failed to initiate payment'
    let statusCode = message.includes('KHALTI_SECRET_KEY') ? 400 : 500

    if (providerMessage === 'Invalid token.') {
      message = 'Khalti rejected KHALTI_SECRET_KEY. Use Khalti SECRET key (not public key), remove extra spaces/quotes, and restart backend.'
      statusCode = 400
    }

    console.error('Initiate payment error:', error?.response?.data || error.message)
    return res.status(statusCode).json({ message })
  }
}

exports.renderEsewaForm = async (req, res) => {
  try {
    const paymentId = String(req.query.paymentId || '').trim()
    const transactionId = String(req.query.transactionId || '').trim()

    if (!paymentId && !transactionId) {
      return res.status(400).send('Invalid eSewa payment parameters')
    }

    let paymentRecord = null
    if (paymentId) {
      paymentRecord = await Payment.findOne({ _id: paymentId, provider: 'esewa' })
    }

    if (!paymentRecord && transactionId) {
      paymentRecord = await Payment.findOne({ transactionId, provider: 'esewa' })
    }

    if (!paymentRecord) {
      return res.status(404).send('Payment transaction not found. Please go back and tap Pay with eSewa again.')
    }

    if (paymentRecord.status !== 'pending') {
      return res.status(400).send('Payment is already processed')
    }

    const baseUrl = resolveBaseUrl(req)
    const successUrl = `${baseUrl}/api/payment/callback/success?paymentId=${encodeURIComponent(paymentRecord._id.toString())}&transactionId=${encodeURIComponent(paymentRecord.transactionId)}`
    const failureUrl = `${baseUrl}/api/payment/callback/failure?paymentId=${encodeURIComponent(paymentRecord._id.toString())}&transactionId=${encodeURIComponent(paymentRecord.transactionId)}`
    const payload = buildEsewaPayload({ amount: paymentRecord.amount, transactionId: paymentRecord.transactionId, successUrl, failureUrl })

    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redirecting to eSewa...</title>
</head>
<body style="font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
  <div style="text-align:center;">
    <p>Redirecting to eSewa payment gateway...</p>
    <form id="esewaForm" action="${escapeHtml(payload.baseUrl)}" method="POST">
      <input type="hidden" name="amount" value="${escapeHtml(payload.amount)}" />
      <input type="hidden" name="tax_amount" value="${escapeHtml(payload.tax_amount)}" />
      <input type="hidden" name="total_amount" value="${escapeHtml(payload.total_amount)}" />
      <input type="hidden" name="transaction_uuid" value="${escapeHtml(payload.transaction_uuid)}" />
      <input type="hidden" name="product_code" value="${escapeHtml(payload.product_code)}" />
      <input type="hidden" name="product_service_charge" value="${escapeHtml(payload.product_service_charge)}" />
      <input type="hidden" name="product_delivery_charge" value="${escapeHtml(payload.product_delivery_charge)}" />
      <input type="hidden" name="success_url" value="${escapeHtml(payload.success_url)}" />
      <input type="hidden" name="failure_url" value="${escapeHtml(payload.failure_url)}" />
      <input type="hidden" name="signed_field_names" value="${escapeHtml(payload.signed_field_names)}" />
      <input type="hidden" name="signature" value="${escapeHtml(payload.signature)}" />
      <button type="submit">Continue to eSewa</button>
    </form>
  </div>
  <script>
    document.getElementById('esewaForm').submit();
  </script>
</body>
</html>
        `)
  } catch (error) {
    console.error('Render eSewa form error:', error.message)
    return res.status(500).send('Failed to start eSewa payment')
  }
}

exports.paymentSuccessPage = async (req, res) => {
  try {
    const { paymentId, transactionId, payload } = parseEsewaCallbackData(req)

    if (!paymentId && !transactionId) {
      return res.status(400).send('Payment completed but transaction details are missing.')
    }

    let paymentRecord = null
    if (paymentId) {
      paymentRecord = await Payment.findOne({ _id: paymentId }).populate('billId')
    }
    if (!paymentRecord && transactionId) {
      paymentRecord = await Payment.findOne({ transactionId }).populate('billId')
    }

    if (!paymentRecord) {
      return res.status(404).send('Payment transaction not found. Please return to app and try payment again.')
    }

    if (paymentRecord.status !== 'success') {
      paymentRecord.status = 'success'
      paymentRecord.paidAt = new Date()
      paymentRecord.callbackData = payload || req.query
      const paymentSaveResult = await paymentRecord.save()
      console.log('Payment record updated:', paymentSaveResult._id, 'Status: success')

      if (paymentRecord.billId && paymentRecord.billId.status !== 'paid') {
        try {
          paymentRecord.billId.status = 'paid'
          paymentRecord.billId.amount = 0
          paymentRecord.billId.paidAt = new Date()
          const billSaveResult = await paymentRecord.billId.save()
          console.log('Bill record updated:', billSaveResult._id, 'Status: paid, Amount: 0')
        } catch (billError) {
          console.error('Failed to update bill record:', billError.message)
          console.error('Bill validation errors:', billError.errors)
          throw billError
        }
      }
    }

    return res.status(200).send('Payment completed successfully. Your bill status is updated.')
  } catch (error) {
    console.error('Payment success callback error:', error.message)
    console.error('Full error details:', error)
    return res.status(500).send('Payment completed, but failed to update bill status. Error: ' + error.message)
  }
}

exports.paymentFailurePage = async (req, res) => {
  try {
    const { paymentId, transactionId, payload } = parseEsewaCallbackData(req)

    let paymentRecord = null
    if (paymentId) {
      paymentRecord = await Payment.findOne({ _id: paymentId })
    }
    if (!paymentRecord && transactionId) {
      paymentRecord = await Payment.findOne({ transactionId })
    }

    if (paymentRecord && paymentRecord.status === 'pending') {
      paymentRecord.status = 'failed'
      paymentRecord.failedAt = new Date()
      paymentRecord.callbackData = payload || req.query
      await paymentRecord.save()
    }

    return res.status(200).send('Payment failed or cancelled. You can go back and try again.')
  } catch (error) {
    console.error('Payment failure callback error:', error.message)
    return res.status(500).send('Failed to update payment status.')
  }
}

exports.getMyBill = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user' })
    }

    let bill = await Bill.findOne({ userId, status: 'pending' }).sort({ dueDate: 1 })

    if (!bill) {
      const latestBill = await Bill.findOne({ userId }).sort({ createdAt: -1 })

      if (!latestBill) {
        bill = await ensureBillForMonth(userId, new Date())
      } else if (latestBill.status === 'paid') {
        bill = await createNextBill(userId, latestBill)
      } else {
        bill = latestBill
      }
    }

    const latestPayment = await Payment.findOne({ userId, billId: bill._id }).sort({ createdAt: -1 })

    return res.json({
      success: true,
      bill: {
        id: bill._id,
        billingMonth: bill.billingMonth,
        amount: bill.amount,
        dueDate: bill.dueDate,
        status: bill.status,
        paidAt: bill.paidAt,
      },
      latestPayment: latestPayment
        ? {
            transactionId: latestPayment.transactionId,
            provider: latestPayment.provider,
            status: latestPayment.status,
            paidAt: latestPayment.paidAt,
            failedAt: latestPayment.failedAt,
          }
        : null,
    })
  } catch (error) {
    console.error('Get my bill error:', error.message)
    return res.status(500).json({ message: 'Failed to fetch bill details' })
  }
}

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user' })
    }

    const successfulPayments = await Payment.find({ userId, status: 'success' })
      .sort({ paidAt: -1 })
      .limit(10)
      .populate('billId', 'billingMonth amount')

    const totalPaid = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0)

    return res.json({
      success: true,
      totalPaid,
      paymentCount: successfulPayments.length,
      payments: successfulPayments.map(p => ({
        id: p._id,
        billMonth: p.billId?.billingMonth || 'Unknown',
        amount: p.amount,
        provider: p.provider,
        date: p.paidAt,
        transactionId: p.transactionId,
      })),
    })
  } catch (error) {
    console.error('Get payment history error:', error.message)
    return res.status(500).json({ message: 'Failed to fetch payment history' })
  }
}

exports.getAdminPaidUsers = async (_req, res) => {
  try {
    const payments = await Payment.find({ status: 'success' })
      .sort({ paidAt: -1, createdAt: -1 })
      .populate('userId', 'name email')
      .populate('billId', 'billingMonth')
      .limit(200)

    const paidUsers = payments.map((payment) => ({
      paymentId: payment._id,
      userId: payment.userId?._id || null,
      userName: payment.userId?.name || 'Unknown User',
      userEmail: payment.userId?.email || 'Unknown Email',
      billMonth: payment.billId?.billingMonth || 'Unknown',
      provider: payment.provider,
      amount: payment.amount,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt || payment.createdAt,
    }))

    const uniqueUserIds = new Set(paidUsers.map((item) => String(item.userId || '')))

    const totalAmountCollected = paidUsers.reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return res.json({
      success: true,
      totalPayments: paidUsers.length,
      totalPaidUsers: Array.from(uniqueUserIds).filter(Boolean).length,
      totalAmountCollected,
      payments: paidUsers,
    })
  } catch (error) {
    console.error('Get admin paid users error:', error.message)
    return res.status(500).json({ message: 'Failed to fetch paid users list' })
  }
}

exports.getAdminMonthlyBillSettings = async (_req, res) => {
  try {
    const monthlyAmount = await getConfiguredMonthlyAmount()

    return res.json({
      success: true,
      monthlyAmount,
      defaultAmount: DEFAULT_BILL_AMOUNT,
    })
  } catch (error) {
    console.error('Get monthly bill settings error:', error.message)
    return res.status(500).json({ message: 'Failed to fetch monthly bill settings' })
  }
}

exports.updateAdminMonthlyBillSettings = async (req, res) => {
  try {
    const rawAmount = Number(req.body?.monthlyAmount)
    const applyToPendingBills = req.body?.applyToPendingBills !== false

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ message: 'monthlyAmount must be a positive number' })
    }

    const monthlyAmount = Number(rawAmount.toFixed(2))

    await BillingConfig.findOneAndUpdate(
      { key: 'global' },
      { $set: { monthlyAmount } },
      { new: true, upsert: true }
    )

    let updatedPendingBills = 0
    if (applyToPendingBills) {
      const updateResult = await Bill.updateMany(
        { status: 'pending' },
        { $set: { amount: monthlyAmount } }
      )
      updatedPendingBills = Number(updateResult?.modifiedCount || 0)
    }

    return res.json({
      success: true,
      monthlyAmount,
      updatedPendingBills,
      message: 'Monthly bill amount updated successfully',
    })
  } catch (error) {
    console.error('Update monthly bill settings error:', error.message)
    return res.status(500).json({ message: 'Failed to update monthly bill settings' })
  }
}
