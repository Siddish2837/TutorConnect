import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../services/bookingService';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookingById(bookingId)
      .then(r => setBooking(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <LoadingSpinner />;
  if (!booking) return (
    <div className="page-container">
      <div className="empty-state"><div className="empty-icon">❌</div><h3>Booking not found</h3></div>
    </div>
  );

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title">Complete Your Booking</h1>
      <p className="page-sub mt-1">Review your session details and pay securely via Razorpay.</p>

      <PaymentModal
        booking={booking}
        tutor={booking.tutor}
        onSuccess={() => navigate('/dashboard/student')}
        onClose={() => navigate('/dashboard/student')}
      />
    </div>
  );
}
