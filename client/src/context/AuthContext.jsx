import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch initial users/personas from backend
  const loadUsersAndInitialState = useCallback(async () => {
    try {
      const res = await api.getUsers();
      if (res.success && res.users) {
        setUsers(res.users);
        // Default to Customer or persisted user
        const saved = localStorage.getItem('ufo_active_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = res.users.find(u => u._id === parsed._id);
          setCurrentUser(found || res.users[0]);
          api.setAuth(found || res.users[0], null);
        } else {
          setCurrentUser(res.users[0]);
          api.setAuth(res.users[0], null);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications for active persona
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUsersAndInitialState();
  }, [loadUsersAndInitialState]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Switch persona instantly
  const switchUser = (user) => {
    setCurrentUser(user);
    api.setAuth(user, null);
    showToast(`Switched active view to ${user.name} (${user.role.toUpperCase()})`);
  };

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id === Date.now() ? null : prev));
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        switchUser,
        notifications,
        unreadCount,
        fetchNotifications,
        markAllRead,
        loading,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--accent-cyan)',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(0, 242, 254, 0.25)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <span style={{ color: 'var(--accent-cyan)', fontSize: '18px' }}>✨</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toastMessage.message}</span>
          <button
            onClick={clearToast}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
