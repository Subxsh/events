import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, MapPin, DollarSign, CreditCard } from 'lucide-react';

const stripePromise = loadStripe('pk_test_your_stripe_publishable_key_here');

const PaymentForm = ({ event, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [rsvpId, setRsvpId] = useState('');

  useEffect(() => {
    createRSVPAndPaymentIntent();
  }, []);

  const createRSVPAndPaymentIntent = async () => {
    try {
      // First create RSVP
      const rsvpResponse = await axios.post('https://eventsdepploy.onrender.com/api/rsvp', {
        eventId: event._id,
        notes: ''
      });

      const newRsvpId = rsvpResponse.data.rsvp._id;
      setRsvpId(newRsvpId);

      // Then create payment intent if event is paid
      if (event.isPaid) {
        const paymentResponse = await axios.post('https://eventsdepploy.onrender.com/api/payment/create-payment-intent', {
          rsvpId: newRsvpId
        });
        setClientSecret(paymentResponse.data.clientSecret);
      }
    } catch (error) {
      console.error('Error creating RSVP/Payment:', error);
      toast.error(error.response?.data?.message || 'Failed to create RSVP');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
      }
    });

    if (error) {
      console.error('Payment error:', error);
      toast.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      try {
        await axios.post('https://eventsdepploy.onrender.com/api/payment/confirm-payment', {
          paymentIntentId: paymentIntent.id
        });
        toast.success('Payment successful! RSVP confirmed.');
        onSuccess();
      } catch (error) {
        console.error('Payment confirmation error:', error);
        toast.error('Payment succeeded but confirmation failed');
      }
    }

    setProcessing(false);
  };

  if (!clientSecret && event.isPaid) {
    return <LoadingSpinner text="Setting up payment..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {event.isPaid && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Event Price:</span>
            <span className="text-2xl font-bold text-green-600">${event.price}</span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="p-3 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full btn-primary flex items-center justify-center space-x-2"
      >
        {processing ? (
          <div className="loading-spinner h-5 w-5"></div>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>
              {event.isPaid ? `Pay $${event.price} & Confirm RSVP` : 'Confirm RSVP'}
            </span>
          </>
        )}
      </button>
    </form>
  );
};

const RSVPPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`https://eventsdepploy.onrender.com/api/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Event not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeRSVP = async () => {
    try {
      await axios.post('https://eventsdepploy.onrender.com/api/rsvp', {
        eventId: event._id,
        notes
      });
      toast.success('RSVP confirmed successfully!');
      navigate('/my-rsvps');
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error(error.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/my-rsvps');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isEventFull = event.currentAttendees >= event.maxAttendees;

  if (isEventFull) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event is Full</h2>
            <p className="text-gray-600 mb-6">
              Sorry, this event has reached its maximum capacity.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Browse Other Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div>
            <div className="card p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>{formatDate(event.date)} at {event.time}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{event.location}</span>
                </div>
                
                {event.isPaid && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-3" />
                    <span>${event.price}</span>
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700">{event.description}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Name: </span>
                  <span className="font-medium">{user?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email: </span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Form */}
          <div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {event.isPaid ? 'Complete Registration & Payment' : 'Confirm Your RSVP'}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              {event.isPaid ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm event={event} onSuccess={handlePaymentSuccess} />
                </Elements>
              ) : (
                <button
                  onClick={handleFreeRSVP}
                  className="w-full btn-primary"
                >
                  Confirm RSVP
                </button>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive a confirmation email</li>
                  <li>• Event details will be saved to your dashboard</li>
                  {event.isPaid && <li>• Payment receipt will be sent to your email</li>}
                  <li>• You can cancel your RSVP anytime before the event</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVPPage;