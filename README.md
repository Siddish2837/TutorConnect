# TutorConnect – Online Tutor Booking System

A full-stack web application built with **React + Node.js + MySQL + Socket.io**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL (XAMPP, MySQL Workbench, or any local MySQL)

### 1. Create MySQL Database
```sql
CREATE DATABASE tutorconnect;
```

### 2. Configure Environment
Edit `server/.env` with your MySQL credentials, JWT secret, email, and Razorpay keys.

### 3. Install & Run
```bash
npm run install:all    # Install all dependencies (root + server + client)
npm run dev            # Start both servers concurrently
```

The app opens at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## 🔑 Demo Accounts (after registering)
- **Student**: register with any email → access student dashboard
- **Tutor**: register with email containing "tutor" OR select Tutor role
- **Admin**: register with email containing "admin" OR select Admin role

---

## 🏗️ Project Structure
```
SE_CBP/
├── client/          # React + Vite frontend (port 3000)
├── server/          # Node.js + Express backend (port 5000)
└── package.json     # Root concurrently scripts
```

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL + Sequelize ORM |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io (chat + whiteboard) |
| Payment | Razorpay (test mode) |
| Email | Nodemailer + Gmail SMTP |
| Scheduler | node-cron (session reminders) |

## 📡 API Endpoints
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/tutors` — List tutors (with filters)
- `POST /api/bookings` — Create booking
- `POST /api/payments/create-order` — Razorpay order
- `POST /api/payments/verify` — Verify payment
- `GET /api/admin/revenue` — Admin stats

## 💳 Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test Key ID and Key Secret from Dashboard → API Keys
3. Add to `server/.env`

## 📧 Email Setup (Gmail)
1. Enable 2-Factor Authentication on Gmail
2. Go to Security → App Passwords → Generate
3. Add email + app password to `server/.env`
