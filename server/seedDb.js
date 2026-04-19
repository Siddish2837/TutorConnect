require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const { User, Tutor, Booking, Payment, Review, Message, Notification } = require('./models');

async function seed() {
  try {
    await db.authenticate();
    console.log('Connected to DB... Clearing existing test data...');
    
    // Clear all existing data to start fresh
    await db.sync({ force: true });
    
    console.log('Inserting mock data...');
    const password_hash = await bcrypt.hash('Password123!', 10);

    // 1. Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@tutorconnect.com',
      password_hash,
      role: 'admin',
      verified: true
    });

    // 2. Students
    const student1 = await User.create({
      name: 'Alice Learner',
      email: 'alice@student.com',
      password_hash,
      role: 'student',
      verified: true
    });
    
    const student2 = await User.create({
      name: 'Bob Student',
      email: 'bob@student.com',
      password_hash,
      role: 'student',
      verified: true
    });

    // 3. Tutors
    const tutorUser1 = await User.create({
      name: 'Dr. John Smith',
      email: 'john@tutor.com',
      password_hash,
      role: 'tutor',
      verified: true,
      avatar_color: '#3b82f6'
    });
    const tutor1 = await Tutor.create({
      user_id: tutorUser1.id,
      subject: 'Mathematics',
      experience: 8,
      price: 500,
      bio: 'Expert in Calculus and Algebra with 8 years of teaching experience. I help students achieve top percentiles in competitive exams.',
      approved: true,
      rating: 4.5,
      review_count: 2,
      tags: ['Calculus', 'Algebra', 'JEE']
    });

    const tutorUser2 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@tutor.com',
      password_hash,
      role: 'tutor',
      verified: true,
      avatar_color: '#10b981'
    });
    const tutor2 = await Tutor.create({
      user_id: tutorUser2.id,
      subject: 'Physics',
      experience: 5,
      price: 400,
      bio: 'Specialized in High School and College Level Physics. Making complex mechanics intuitive and easy to grasp.',
      approved: true,
      rating: 5,
      review_count: 1,
      tags: ['Mechanics', 'Quantum', 'High School']
    });

    const tutorUserUnapproved = await User.create({
      name: 'Pending Tutor',
      email: 'pending@tutor.com',
      password_hash,
      role: 'tutor',
      verified: true
    });
    const tutorPending = await Tutor.create({
      user_id: tutorUserUnapproved.id,
      subject: 'Biology',
      experience: 2,
      price: 300,
      bio: 'Biology tutor awaiting approval from the administration.',
      approved: false,
      tags: ['Botany', 'Zoology']
    });

    // 4. Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const b1 = await Booking.create({
      student_id: student1.id,
      tutor_id: tutor1.id,
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 60,
      amount: 500,
      status: 'confirmed',
      session_link: 'https://meet.google.com/abc-defg-hij'
    });

    const b2 = await Booking.create({
      student_id: student2.id,
      tutor_id: tutor1.id,
      date: today.toISOString().split('T')[0],
      time: '09:00 AM',
      duration: 60,
      amount: 500,
      status: 'completed'
    });

    const b3 = await Booking.create({
      student_id: student1.id,
      tutor_id: tutor2.id,
      date: nextWeek.toISOString().split('T')[0],
      time: '02:00 PM',
      duration: 60,
      amount: 400,
      status: 'pending'
    });

    // 5. Payments
    await Payment.create({ booking_id: b1.id, amount: 500, status: 'success', method: 'UPI', razorpay_payment_id: 'pay_ABC123' });
    await Payment.create({ booking_id: b2.id, amount: 500, status: 'success', method: 'Card', razorpay_payment_id: 'pay_XYZ789' });

    // 6. Reviews
    await Review.create({ student_id: student2.id, tutor_id: tutor1.id, booking_id: b2.id, rating: 5, comment: 'Dr. Smith explained integration perfectly. Highly recommend!' });
    await Review.create({ student_id: student1.id, tutor_id: tutor1.id, rating: 4, comment: 'Great session on vectors.' });
    await Review.create({ student_id: student1.id, tutor_id: tutor2.id, rating: 5, comment: 'Sarah is amazing at explaining kinematics.' });

    // 7. Messages
    await Message.create({ sender_id: student1.id, receiver_id: tutorUser1.id, content: 'Hi Dr. Smith, looking forward to our session tomorrow!' });
    await Message.create({ sender_id: tutorUser1.id, receiver_id: student1.id, content: 'Me too Alice! Please keep your doubt list ready.' });

    // 8. Notifications
    await Notification.create({ user_id: tutorUser1.id, type: 'booking_confirmed', title: 'Session Confirmed', message: 'You have a new session with Alice Learner tomorrow.' });
    await Notification.create({ user_id: admin.id, type: 'system', title: 'New Approvals', message: 'Pending tutors waiting for approval.' });
    await Notification.create({ user_id: student1.id, type: 'payment_success', title: 'Payment Successful', message: 'Your payment of ₹500 was successful.' });

    console.log('✅ Dummy Data Inserted Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
