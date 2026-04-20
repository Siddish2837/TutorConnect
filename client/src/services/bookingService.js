import api from './api';

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const getAvailableSlots = (tutorId, date) => api.get('/bookings/slots', { params: { tutorId, date } });
export const respondBooking = (id, status) => api.put(`/bookings/${id}/respond`, { status });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const completeBooking = (id) => api.put(`/bookings/${id}/complete`);
export const updateSessionNotes = (id, notes) => api.put(`/bookings/${id}/notes`, { notes });
export const getSessionHistory = (id) => api.get(`/bookings/${id}/history`);
