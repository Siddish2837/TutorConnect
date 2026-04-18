import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnread(data.filter((n) => !n.read).length);
    } catch {}
  }, [user, token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnread((prev) => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unread, markAllRead, addNotification, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
