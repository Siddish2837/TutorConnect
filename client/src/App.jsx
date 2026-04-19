import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Search from './pages/Search';
import TutorProfile from './pages/TutorProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LiveSession from './pages/LiveSession';
import Checkout from './pages/Checkout';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <div className="app-root">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/tutor/:id" element={<TutorProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify/:token" element={<VerifyEmail />} />
                <Route path="/reset-password/:token" element={<ForgotPassword />} />

                <Route path="/dashboard/student" element={
                  <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
                } />
                <Route path="/dashboard/tutor" element={
                  <ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/session/:bookingId" element={
                  <ProtectedRoute><LiveSession /></ProtectedRoute>
                } />
                <Route path="/checkout/:bookingId" element={
                  <ProtectedRoute role="student"><Checkout /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
