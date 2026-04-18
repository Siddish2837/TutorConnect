const { v4: uuidv4 } = require('uuid');

exports.generateMeetLink = () => {
  const code = uuidv4().replace(/-/g, '').substring(0, 12);
  const formatted = `${code.slice(0,3)}-${code.slice(3,7)}-${code.slice(7)}`;
  return `https://meet.google.com/${formatted}`;
};

exports.getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);

exports.formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
