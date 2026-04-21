import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAvailableSlots, rescheduleBooking } from '../services/bookingService';

export default function RescheduleModal({ booking, onClose, onSuccess }) {
  const [date, setDate] = useState(booking.date);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    getAvailableSlots(booking.tutor_id, date)
      .then(res => setSlots(res.data || []))
      .catch(() => toast.error('Failed to load slots'))
      .finally(() => setLoadingSlots(false));
  }, [date, booking.tutor_id]);

  const handleSubmit = async () => {
    if (!selectedTime) { toast.error('Please select a time slot'); return; }
    if (date === booking.date && selectedTime === booking.time) { toast.error('Please select a new time or date'); return; }
    
    setSaving(true);
    try {
      await rescheduleBooking(booking.id, date, selectedTime);
      toast.success('Session rescheduled successfully!');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setSaving(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal animate-slide" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">Reschedule Session 🔄</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="text-muted text-sm mb-4">
            Select a new date and time to reschedule the session.
            <br/>Original: <strong style={{ color: 'var(--text)' }}>{booking.date} at {booking.time}</strong>
          </p>

          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input 
              type="date" 
              className="form-input" 
              min={getMinDate()}
              value={date} 
              onChange={e => { setDate(e.target.value); setSelectedTime(''); }} 
            />
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Available Times</label>
            {loadingSlots ? (
              <div className="text-muted text-sm my-2">Loading available times...</div>
            ) : slots.length > 0 ? (
              <div className="grid-3 mt-2">
                {slots.map(s => (
                  <button
                    key={s.time}
                    className={`btn btn-sm ${!s.available ? 'btn-ghost' : selectedTime === s.time ? 'btn-primary' : 'btn-outline'}`}
                    disabled={!s.available}
                    onClick={() => setSelectedTime(s.time)}
                    style={{ whiteSpace: 'nowrap', opacity: s.available ? 1 : 0.4 }}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-muted text-sm my-2">No slots loaded.</div>
            )}
          </div>
        </div>
        <div className="modal-footer mt-4">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !selectedTime}>
            {saving ? 'Saving...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
