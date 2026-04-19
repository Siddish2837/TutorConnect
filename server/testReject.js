require('dotenv').config();
const axios = require('axios');

async function testReject() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api' });
    
    // Login as Student
    const res = await api.post('/auth/login', { email: 'alice@student.com', password: 'Password123!' });
    const token = res.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const bRes = await api.get('/bookings/my');
    console.log(`Found ${bRes.data.length} bookings`);
    
    // Find any booking that is NOT cancelled
    const activeBooking = bRes.data.find(b => !['cancelled', 'completed', 'rejected'].includes(b.status));
    if (!activeBooking) {
      console.log('No active booking found to cancel!');
      return;
    }

    console.log(`Attempting to cancel booking ${activeBooking.id}...`);
    const respondRes = await api.put(`/bookings/${activeBooking.id}/cancel`);
    console.log('SUCCESS:', respondRes.data);

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Network Error:', err.message);
    }
  }
}

testReject();
