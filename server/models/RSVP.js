const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'not_required'],
    default: 'not_required'
  },
  paymentIntentId: {
    type: String
  },
  amount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure one RSVP per user per event
rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', rsvpSchema);