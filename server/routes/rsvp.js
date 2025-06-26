const express = require('express');
const { body, validationResult } = require('express-validator');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's RSVPs
router.get('/my-rsvps', auth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json(rsvps);
  } catch (error) {
    console.error('Get RSVPs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all RSVPs for an event (admin only)
router.get('/event/:eventId', adminAuth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ createdAt: -1 });

    res.json(rsvps);
  } catch (error) {
    console.error('Get event RSVPs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create RSVP
router.post('/', [auth, [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, notes } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user already has RSVP for this event
    const existingRSVP = await RSVP.findOne({ user: req.user._id, event: eventId });
    if (existingRSVP) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    // Create RSVP
    const rsvpData = {
      user: req.user._id,
      event: eventId,
      notes,
      amount: event.price,
      paymentStatus: event.isPaid ? 'pending' : 'not_required'
    };

    const rsvp = new RSVP(rsvpData);
    await rsvp.save();

    // Update event attendee count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: 1 }
    });

    const populatedRSVP = await RSVP.findById(rsvp._id)
      .populate('event')
      .populate('user', 'name email');

    res.status(201).json({
      message: 'RSVP created successfully',
      rsvp: populatedRSVP
    });
  } catch (error) {
    console.error('Create RSVP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel RSVP
router.delete('/:id', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id);
    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP not found' });
    }

    // Check if user owns this RSVP
    if (rsvp.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this RSVP' });
    }

    // Update event attendee count
    await Event.findByIdAndUpdate(rsvp.event, {
      $inc: { currentAttendees: -1 }
    });

    // Delete RSVP
    await RSVP.findByIdAndDelete(req.params.id);

    res.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;