const axios = require('axios');

async function testRender() {
  try {
    const res = await axios.post('https://tutorconnect-api-wkkw.onrender.com/api/auth/register', {
      name: 'Test Render User',
      email: `test_${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'student'
    });
    console.log('SUCCESS:', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.log('API REJECTED:', err.response.status, err.response.data);
    } else {
      console.log('NETWORK ERROR:', err.message);
    }
  }
}

testRender();
