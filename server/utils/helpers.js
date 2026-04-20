const { v4: uuidv4 } = require('uuid');

exports.generateMeetLink = (bookingId) => {
  const code = bookingId ? bookingId.substring(0, 10) : uuidv4().replace(/-/g, '').substring(0, 10);
  return `https://meet.jit.si/TutorConnect-Session-${code}`;
};

exports.getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);

exports.formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
