import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('esport_hub_token');
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const res = await notificationsAPI.list();
      if (res.data && res.data.success && res.data.notifications) {
        setNotifications(res.data.notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.isRead,
          link: n.actionUrl || null,
          createdAt: n.createdAt
        })));
      }
    } catch (err) {
      // Handled silently
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await notificationsAPI.markAsRead(id);
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationsAPI.markAllRead();
    } catch (e) {}
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      addNotification,
      refetch: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
