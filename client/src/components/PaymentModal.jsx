import { useState } from 'react';
import toast from 'react-hot-toast';
import { createOrder, verifyPayment } from '../services/paymentService';

export default function PaymentModal({ booking, tutor, onSuccess, onClose }) {
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data: order } = await createOrder(booking.id);

      if (window.Razorpay) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'TutorConnect',
          description: `Session with ${tutor?.user?.name}`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
                method,
              });
              toast.success('Payment successful! Booking confirmed 🎉');
              onSuccess?.();
              onClose?.();
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: booking.student?.name },
          theme: { color: '#6366f1' },
          modal: { ondismiss: () => setLoading(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Dev fallback (no Razorpay keys)
        await verifyPayment({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: 'dev_signature',
          bookingId: booking.id, method,
        });
        toast.success('Payment confirmed (dev mode) 🎉');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { id: 'upi', label: '💳 UPI', icon: '💳' },
    { id: 'card', label: '🏦 Card', icon: '🏦' },
    { id: 'netbanking', label: '🌐 Net Banking', icon: '🌐' },
  ];

  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <div className="modal-title">Complete Payment</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Summary */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Tutor</span>
              <span className="font-600">{tutor?.user?.name}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Date & Time</span>
              <span>{booking.date} at {booking.time}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted">Duration</span>
              <span>{booking.duration} minutes</span>
            </div>
            <div className="flex justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <span className="font-bold">Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{booking.amount}</span>
            </div>
          </div>

          {/* Method */}
          <div className="font-600 text-sm mb-2">Payment Method</div>
          <div className="flex gap-2 mb-4">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                flex: 1, padding: '0.75rem 0.5rem', border: '2px solid',
                borderColor: method === m.id ? 'var(--primary)' : 'var(--border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center',
                fontSize: '0.82rem', fontWeight: 600,
                color: method === m.id ? 'var(--primary)' : 'var(--text-muted)',
                background: method === m.id ? 'var(--primary-light)' : 'transparent',
                transition: 'var(--transition)',
              }}>{m.label}</button>
            ))}
          </div>

          <div className="alert alert-info text-sm">
            🔒 Secured via Razorpay. Your payment details are encrypted.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
            {loading ? '⏳ Processing...' : `Pay ₹${booking.amount} & Confirm`}
          </button>
        </div>
      </div>
    </div>
  );
}
