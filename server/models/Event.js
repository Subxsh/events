const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'seminar', 'networking', 'social', 'other']
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: '/uploads/default-event-cover.jpg'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentAttendees >= this.maxAttendees;
});

module.exports = mongoose.model('Event', eventSchema);