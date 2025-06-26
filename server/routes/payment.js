const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { rsvpId } = req.body;

    const rsvp = await RSVP.findById(rsvpId).populate('event');
    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP not found' });
    }

    // Check if user owns this RSVP
    if (rsvp.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if payment is required
    if (!rsvp.event.isPaid || rsvp.amount === 0) {
      return res.status(400).json({ message: 'Payment not required for this event' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(rsvp.amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        rsvpId: rsvp._id.toString(),
        eventId: rsvp.event._id.toString(),
        userId: req.user._id.toString()
      }
    });

    // Update RSVP with payment intent ID
    await RSVP.findByIdAndUpdate(rsvpId, {
      paymentIntentId: paymentIntent.id
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: rsvp.amount
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update RSVP payment status
      const rsvp = await RSVP.findOneAndUpdate(
        { paymentIntentId },
        { paymentStatus: 'paid' },
        { new: true }
      ).populate('event');

      if (rsvp) {
        res.json({
          message: 'Payment confirmed successfully',
          rsvp
        });
      } else {
        res.status(404).json({ message: 'RSVP not found' });
      }
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stripe webhook (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update RSVP payment status
      await RSVP.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: 'paid' }
      );
      
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      // Update RSVP payment status
      await RSVP.findOneAndUpdate(
        { paymentIntentId: failedPayment.id },
        { paymentStatus: 'failed' }
      );
      
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;