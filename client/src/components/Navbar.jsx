import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Bell, 
  UserCheck, 
  PlusCircle, 
  Check, 
  ExternalLink, 
  Activity, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenRequestModal }) => {
  const { users, currentUser, switchUser, notifications, unreadCount, markAllRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'customer':
        return { bg: 'rgba(0, 242, 254, 0.15)', text: '#00f2fe', label: 'Customer Portal' };
      case 'advisor':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Service Advisor' };
      case 'technician':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', label: 'Master Technician' };
      case 'admin':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', label: 'Fleet Admin' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', text: '#fff', label: role };
    }
  };

  const badge = getRoleBadgeStyle(currentUser?.role);

  return (
    <header style={{
      background: 'rgba(10, 15, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 0',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.35)',
              color: '#030712',
            }}>
              <Car size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                URBAN FLEET <span style={{ color: 'var(--accent-cyan)' }}>OPS</span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}>
                Vehicle Service Management
              </div>
            </div>
          </div>
        </div>

        {/* Persona Switcher Pill Bar (Pega Roles Testing) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.25rem 0.35rem',
          gap: '0.25rem',
        }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            padding: '0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <Layers size={13} />
            Persona:
          </span>

          {users.map(u => {
            const isActive = currentUser?._id === u._id;
            return (
              <button
                key={u._id}
                onClick={() => switchUser(u)}
                style={{
                  background: isActive ? 'var(--grad-cyan-blue)' : 'transparent',
                  color: isActive ? '#030712' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 242, 254, 0.3)' : 'none',
                }}
              >
                {isActive && <Check size={12} strokeWidth={3} />}
                {u.role.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Right Section: Actions & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Raise Request Button (Visible to Customer or Admin) */}
          <button
            onClick={onOpenRequestModal}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={16} />
            <span>Book Service</span>
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: unreadCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '360px',
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg), 0 0 25px rgba(0, 0, 0, 0.7)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'slideUp 0.2s ease',
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                    Automated Notifications
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: n.isRead ? 'transparent' : 'rgba(0, 242, 254, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: n.isRead ? '#cbd5e1' : '#ffffff',
                        }}>
                          <span>{n.title}</span>
                          {n.caseId && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(255, 255, 255, 0.06)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: 'var(--accent-cyan)',
                            }}>
                              {n.caseId}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active User Badge & Avatar */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${badge.text}`,
                }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: badge.text, fontWeight: 600 }}>
                  {badge.label}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
