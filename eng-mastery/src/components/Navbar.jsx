import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import AuthModal from './AuthModal';
import { apiFetch, clearTokens } from '../services/apiService';
import { getCartCount } from '../services/cartUtils';

const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" strokeWidth="2" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

const BagIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 7h12l-1 13H7L6 7Z" strokeWidth="1.8" />
    <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
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

  useEffect(() => {
    const onCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, []);

  useEffect(() => {
    const onLogout = () => {
      window.location.href = '/';
    };
    const onUserUpdated = (e) => {
      setUser(e.detail);
    };
    window.addEventListener('auth-logout', onLogout);
    window.addEventListener('auth-user-updated', onUserUpdated);
    return () => {
      window.removeEventListener('auth-logout', onLogout);
      window.removeEventListener('auth-user-updated', onUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unreadTimer = window.setTimeout(fetchUnreadCount, 0);

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
        console.error(`Broker reported error: ${frame.headers.message}`);
      },
    });

    stompClient.activate();

    const handleResetUnread = () => fetchUnreadCount();
    window.addEventListener('chat-unread-reset', handleResetUnread);

    return () => {
      window.clearTimeout(unreadTimer);
      stompClient.deactivate();
      window.removeEventListener('chat-unread-reset', handleResetUnread);
    };
  }, [user]);

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
    if (data.user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    clearTokens();
    window.location.href = '/';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  };

  const openLogin = () => {
    setModalTab('login');
    setModalOpen(true);
  };

  const openRegister = () => {
    setModalTab('register');
    setModalOpen(true);
  };

  const avatarLetter = user
    ? (user.displayName || user.username || 'U')[0].toUpperCase()
    : 'U';

  return (
    <>
      <nav className="coursera-nav">
        <div className="coursera-nav__inner">
          <Link className="brand" to="/">
            <span className="brand__mark">E</span>
            <span>EngMastery</span>
          </Link>

          <Link className="catalog-link" to="/courses">Khám phá</Link>

          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Bạn muốn học gì?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Tìm kiếm">
              <SearchIcon />
            </button>
          </form>

          <div className="nav-links">
            <Link className="nav-link" to="/">Trang chủ</Link>
            <Link className="nav-link" to="/courses">Khóa học</Link>

            {user && !user?.roles?.includes('ROLE_TEACHER') && (
              <>
                <Link className="nav-link" to="/dashboard">Của tôi</Link>
                <Link className="nav-link" to="/orders">Đơn hàng</Link>
              </>
            )}

            {user?.roles?.includes('ROLE_TEACHER') && (
              <>
                <Link className="nav-link" to="/teacher/courses">Giảng dạy</Link>
                <Link className="nav-link" to="/revenue">Doanh thu</Link>
              </>
            )}

            {user && (
              <Link className="nav-link" to="/messages">
                Tin nhắn
                {unreadChatCount > 0 && <span className="nav-badge">{unreadChatCount}</span>}
              </Link>
            )}

            <Link className="nav-link" to="/cart" aria-label="Giỏ hàng">
              <BagIcon />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </Link>
          </div>

          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative', flex: '0 0 auto' }}>
              <button className="avatar-button" type="button" onClick={() => setDropdownOpen((open) => !open)}>
                <span className="avatar-circle">{avatarLetter}</span>
                <span style={{ color: '#1f1f1f', fontWeight: 700, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.username}
                </span>
                <ChevronIcon />
              </button>

              {dropdownOpen && (
                <div className="user-menu">
                  <div style={{ padding: 16, borderBottom: '1px solid #d1d7dc' }}>
                    <p style={{ fontWeight: 700, color: '#1f1f1f' }}>{user.displayName || user.username}</p>
                    <p style={{ color: '#636363', fontSize: 13, marginTop: 2 }}>{user.email}</p>
                  </div>

                  <Link className="dropdown-link" to="/profile" onClick={() => setDropdownOpen(false)}>
                    Thông tin tài khoản
                  </Link>

                  {!user.roles?.includes('ROLE_TEACHER') && (
                    <Link className="dropdown-link" to="/dashboard" onClick={() => setDropdownOpen(false)}>
                      Khóa học của tôi
                    </Link>
                  )}
                  {user.roles?.includes('ROLE_TEACHER') && (
                    <>
                      <Link className="dropdown-link" to="/teacher/courses" onClick={() => setDropdownOpen(false)}>
                        Khóa học giảng dạy
                      </Link>
                      <Link className="dropdown-link" to="/teacher/comments" onClick={() => setDropdownOpen(false)}>
                        Quản lý bình luận
                      </Link>
                      <Link className="dropdown-link" to="/teacher/vouchers" onClick={() => setDropdownOpen(false)}>
                        Mã giảm giá (Voucher)
                      </Link>
                      <Link className="dropdown-link" to="/revenue" onClick={() => setDropdownOpen(false)}>
                        Doanh thu
                      </Link>
                      <Link className="dropdown-link" to="/create-course" onClick={() => setDropdownOpen(false)}>
                        Tạo khóa học
                      </Link>
                    </>
                  )}
                  {user.roles?.includes('ROLE_ADMIN') && (
                    <Link className="dropdown-link" to="/admin" onClick={() => setDropdownOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button className="dropdown-button" type="button" onClick={handleLogout} style={{ color: '#b32d0f', borderTop: '1px solid #d1d7dc' }}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <button className="btn btn-secondary" type="button" onClick={openLogin}>Đăng nhập</button>
              <button className="btn btn-primary" type="button" onClick={openRegister}>Đăng ký</button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={modalTab}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;
