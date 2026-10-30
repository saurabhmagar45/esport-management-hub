import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Tournament } from '../models/Tournament.js';
import { Registration } from '../models/Registration.js';
import { AuditLog } from '../models/AuditLog.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_esporthub_demo';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_esporthub_demo_123';

// @desc Create a test/sandbox Razorpay order for paid tournaments
// @route POST /api/v1/payments/create-order
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { tournamentId, teamId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.entryFee <= 0) {
      return res.status(400).json({ success: false, message: 'This tournament is free. No payment required.' });
    }

    // Check for existing captured payment
    const existingPaid = await Payment.findOne({
      user: req.user._id,
      tournament: tournamentId,
      status: 'captured'
    });

    if (existingPaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this tournament registration.'
      });
    }

    // Generate unique mock/sandbox order id (conforming to rzp order format)
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const payment = await Payment.create({
      user: req.user._id,
      tournament: tournamentId,
      team: teamId,
      amount: tournament.entryFee,
      currency: tournament.currency || 'INR',
      orderId,
      status: 'created'
    });

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        amount: tournament.entryFee * 100, // paisa
        currency: tournament.currency || 'INR',
        keyId: RAZORPAY_KEY_ID,
        tournamentName: tournament.name
      },
      paymentRecordId: payment._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc Server-side verification of payment signature
// @route POST /api/v1/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: 'orderId and paymentId are required' });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order record not found' });
    }

    if (payment.status === 'captured') {
      return res.status(400).json({ success: false, message: 'Payment has already been verified and captured' });
    }

    // Server-side HMAC SHA-256 validation
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // In test/demo mode, accept either matching cryptographic signature OR test signature
    const isValid = signature === expectedSignature || signature === 'test_valid_signature';

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Cryptographic signature verification failed' });
    }

    // Mark payment as captured
    payment.status = 'captured';
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.verifiedAt = new Date();
    await payment.save();

    // Update associated registration if present
    await Registration.findOneAndUpdate(
      { tournament: payment.tournament, team: payment.team },
      { paymentStatus: 'paid' }
    );

    // Audit log
    await AuditLog.create({
      action: 'PAYMENT_VERIFIED',
      performedBy: req.user._id,
      targetType: 'Payment',
      targetId: payment._id,
      details: { amount: payment.amount, orderId, paymentId }
    });

    res.json({
      success: true,
      message: 'Payment successfully verified and registration updated to paid status',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user payment history
// @route GET /api/v1/payments/history
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('tournament', 'name game banner entryFee')
      .populate('team', 'name tag')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    next(error);
  }
};
