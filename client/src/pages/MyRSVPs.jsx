import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, MapPin, DollarSign, X, Eye } from 'lucide-react';

const MyRSVPs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRSVPs();
  }, []);

  const fetchMyRSVPs = async () => {
    try {
      const response = await axios.get('https://eventsdepploy.onrender.com/api/rsvp/my-rsvps');
      setRsvps(response.data);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast.error('Failed to fetch your RSVPs');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async (rsvpId) => {
    if (!window.confirm('Are you sure you want to cancel this RSVP?')) {
      return;
    }

    try {
      await axios.delete(`https://eventsdepploy.onrender.com/api/rsvp/${rsvpId}`);
      toast.success('RSVP cancelled successfully');
      fetchMyRSVPs(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'not_required':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your RSVPs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My RSVPs</h1>
          <p className="text-gray-600 mt-2">
            Manage your event registrations and view upcoming events
          </p>
        </div>

        {/* RSVPs List */}
        {rsvps.length === 0 ? (
          <div className="text-center py-12">
            <div className="card p-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RSVPs Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't RSVP'd to any events yet. Browse our events to get started!
              </p>
              <Link to="/" className="btn-primary">
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {rsvps.map((rsvp) => (
              <div key={rsvp._id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {rsvp.event.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rsvp.status)}`}>
                            {rsvp.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(rsvp.paymentStatus)}`}>
                            {rsvp.paymentStatus.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(rsvp.event.date)} at {rsvp.event.time}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{rsvp.event.location}</span>
                          </div>
                          
                          {rsvp.event.isPaid && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>${rsvp.event.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {rsvp.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Your notes:</strong> {rsvp.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                    <Link
                      to={`/events/${rsvp.event._id}`}
                      className="btn-outline flex items-center justify-center space-x-2 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Event</span>
                    </Link>
                    
                    {rsvp.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelRSVP(rsvp._id)}
                        className="flex items-center justify-center space-x-2 text-sm px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel RSVP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* RSVP Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    RSVP'd on {new Date(rsvp.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRSVPs;