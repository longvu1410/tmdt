import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthModal from './AuthModal';
import { clearTokens, apiFetch } from '../services/apiService';
import { getCartCount } from '../services/cartUtils';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await apiFetch('/api/chat/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadChatCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch unread count:', e);
    }
  };


  // Load user từ localStorage khi mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Lắng nghe cart-updated để cập nhật badge
  useEffect(() => {
    const onCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, []);

  // Lắng nghe auth-logout (khi refresh token thất bại)
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setDropdownOpen(false);
    };
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, []);

  // Lắng nghe WebSocket tin nhắn mới và quản lý unread count
  useEffect(() => {
    if (!user) {
      setUnreadChatCount(0);
      return;
    }

    fetchUnreadCount();

    const socket = new SockJS('https://api.hatruong.id.vn/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/chat/${user.id}`, (message) => {
          const msg = JSON.parse(message.body);
          if (msg.senderId !== user.id) {
            fetchUnreadCount();
            window.dispatchEvent(new CustomEvent('new-message-received', { detail: msg }));
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    stompClient.activate();

    const handleResetUnread = () => fetchUnreadCount();
    window.addEventListener('chat-unread-reset', handleResetUnread);

    return () => {
      stompClient.deactivate();
      window.removeEventListener('chat-unread-reset', handleResetUnread);
    };
  }, [user]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    // Redirect admin to dashboard after login
    if (data.user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/admin');
    }
  };


  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setDropdownOpen(false);
  };

  const openLogin = () => { setModalTab('login'); setModalOpen(true); };
  const openRegister = () => { setModalTab('register'); setModalOpen(true); };

  const avatarLetter = user
    ? (user.displayName || user.username || 'U')[0].toUpperCase()
    : 'U';

  return (
    <>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        <div style={{
          maxWidth: '1340px', margin: '0 auto', padding: '0 24px',
          height: '64px', display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="4" fill="#0056D2"/>
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="serif">E</text>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#0056D2' }}>EngMastery</span>
          </Link>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: '40px', border: '1px solid #9CA3AF',
                borderRadius: '24px', padding: '0 16px 0 44px', fontSize: '14px',
                outline: 'none', background: '#F9FAFB', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#0056D2'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#9CA3AF'; e.target.style.background = '#F9FAFB'; }}
            />
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            <Link to="/" style={navLinkStyle}>Trang chủ</Link>
            <Link to="/courses" style={navLinkStyle}>Khóa học</Link>
            
            {user && !user?.roles?.includes('ROLE_TEACHER') && (
              <>
                <Link to="/dashboard" style={navLinkStyle}>Khóa học của tôi</Link>
                <Link to="/orders" style={navLinkStyle}>Đơn hàng</Link>
              </>
            )}

            {user?.roles?.includes('ROLE_TEACHER') && (
              <>
                <Link to="/teacher/courses" style={navLinkStyle}>Khóa học của tôi</Link>
                <Link to="/revenue" style={{ ...navLinkStyle, color: '#0056D2', fontWeight: 600 }}>Xem doanh thu</Link>
              </>
            )}

            {user && (
              <Link to="/messages" style={{ ...navLinkStyle, position: 'relative' }}>
                Tin nhắn
                {unreadChatCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-6px',
                    background: '#EF4444', color: '#fff', borderRadius: '50%',
                    width: '18px', height: '18px', fontSize: '11px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadChatCount}</span>
                )}
              </Link>
            )}

            <Link to="/cart" style={{ ...navLinkStyle, position: 'relative' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-8px',
                  background: '#0056D2', color: '#fff', borderRadius: '50%',
                  width: '18px', height: '18px', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </Link>
          </div>

          {/* Auth Area */}
          {user ? (
            /* User Avatar + Dropdown */
            <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#0056D2', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '15px',
                }}>{avatarLetter}</div>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  {user.displayName || user.username}
                </span>
                <svg width="14" height="14" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0,
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 100,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px' }}>{user.displayName || user.username}</p>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>{user.email}</p>
                  </div>
                  {!user.roles?.includes('ROLE_TEACHER') && (
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#374151' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >📚 Khóa học của tôi</Link>
                  )}
                  {user.roles?.includes('ROLE_TEACHER') && (
                    <Link to="/teacher/courses" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#374151' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >📚 Khóa học của tôi</Link>
                  )}
                  {user.roles?.includes('ROLE_TEACHER') && (
                    <Link to="/revenue" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#374151' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >💰 Xem doanh thu</Link>
                  )}
                  {user.roles?.includes('ROLE_TEACHER') && (
                    <Link to="/create-course" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#374151' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >➕ Tạo khóa học</Link>
                  )}
                  {user.roles?.includes('ROLE_ADMIN') && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontSize: '14px', color: '#6366F1', fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >⚙️ Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'none', border: 'none', fontSize: '14px', color: '#DC2626',
                    cursor: 'pointer', borderTop: '1px solid #F3F4F6',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register Buttons */
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={openLogin} style={{
                padding: '8px 20px', border: '1px solid #0056D2', color: '#0056D2',
                background: '#fff', borderRadius: '4px', fontSize: '14px', fontWeight: 600,
              }}>Đăng nhập</button>
              <button onClick={openRegister} style={{
                padding: '8px 20px', background: '#0056D2', color: '#fff',
                border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600,
              }}>Đăng ký</button>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={modalTab}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

const navLinkStyle = {
  padding: '8px 12px', fontSize: '15px', fontWeight: 500, color: '#374151',
  borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px',
};

export default Navbar;
