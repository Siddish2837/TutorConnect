import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isToday, isSameDay } from 'date-fns';
import { getAvailableSlots } from '../services/bookingService';

export default function BookingCalendar({ tutorId, onDateSelect, onSlotSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);
  const today = new Date();

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = async (day) => {
    if (isBefore(day, today) && !isToday(day)) return;
    setSelectedDate(day);
    setSelectedSlot(null);
    onDateSelect?.(format(day, 'yyyy-MM-dd'));
    setLoadingSlots(true);
    try {
      const { data } = await getAvailableSlots(tutorId, format(day, 'yyyy-MM-dd'));
      setSlots(data);
    } catch {
      setSlots([
        { time: '09:00 AM', available: true }, { time: '10:00 AM', available: false },
        { time: '11:00 AM', available: true }, { time: '12:00 PM', available: true },
        { time: '02:00 PM', available: true }, { time: '03:00 PM', available: false },
        { time: '04:00 PM', available: true }, { time: '05:00 PM', available: true },
      ]);
    } finally { setLoadingSlots(false); }
  };

  const selectSlot = (slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot.time);
    onSlotSelect?.(slot.time);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
      </div>

      {/* Day headers */}
      <div style={calGridStyle}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={calHeaderStyle}>{d}</div>
        ))}
        {/* Padding */}
        {Array.from({ length: startPad }).map((_, i) => <div key={`p-${i}`} />)}
        {/* Days */}
        {days.map(day => {
          const past = isBefore(day, today) && !isToday(day);
          const todayDay = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          return (
            <div
              key={day.toString()}
              onClick={() => selectDay(day)}
              style={{
                ...calDayStyle,
                ...(past ? pastStyle : {}),
                ...(todayDay ? todayStyle : {}),
                ...(selected ? selectedStyle : {}),
                ...(!past && !todayDay && !selected ? availStyle : {}),
              }}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
            Available Times for {format(selectedDate, 'MMM d, yyyy')}
          </div>
          {loadingSlots ? (
            <div className="text-muted text-sm">Loading slots...</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => selectSlot(slot)}
                  disabled={!slot.available}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                    border: '1px solid',
                    transition: 'var(--transition)',
                    ...(!slot.available ? { borderColor: 'var(--border)', color: 'var(--text-dim)', background: 'transparent', opacity: 0.4 }
                      : selectedSlot === slot.time ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }
                      : { borderColor: 'var(--border-accent)', color: 'var(--primary)', background: 'var(--primary-light)' }),
                  }}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const calGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 };
const calHeaderStyle = { textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 0' };
const calDayStyle = { padding: '0.5rem', textAlign: 'center', fontSize: '0.82rem', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 500, transition: 'var(--transition)', border: '1px solid transparent' };
const pastStyle = { color: 'var(--text-dim)', cursor: 'default', opacity: 0.5 };
const todayStyle = { color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' };
const selectedStyle = { background: 'var(--primary)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.4)', border: 'none', textDecoration: 'none' };
const availStyle = { ':hover': { background: 'var(--primary-light)', color: 'var(--primary)' } };
