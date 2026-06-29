import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    const parsed = JSON.parse(savedUser);
    setUser(parsed);
    setDisplayName(parsed.displayName || parsed.username || '');
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Tên hiển thị không được để trống.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Cập nhật hồ sơ thất bại.' });
        return;
      }

      // Update localStorage & state
      const updatedUser = { ...user, displayName: data.displayName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Dispatch custom event to notify Navbar and other components
      window.dispatchEvent(new Event('storage')); 
      // Force user state reload on navbar by raising custom authentication update
      window.dispatchEvent(new CustomEvent('auth-user-updated', { detail: updatedUser }));

      setMessage({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
    } catch {
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin mật khẩu.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/profile/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Mật khẩu hiện tại không chính xác.' });
        return;
      }
      setMessage({ type: 'success', text: 'Thay đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleLabel = user.roles?.includes('ROLE_ADMIN') 
    ? 'Quản trị viên' 
    : user.roles?.includes('ROLE_TEACHER') 
      ? 'Giảng viên' 
      : 'Học viên';

  const containerStyle = {
    maxWidth: '850px',
    margin: '40px auto',
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '32px',
  };

  const cardStyle = {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const inputStyle = {
    width: '100%',
    height: '44px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    padding: '0 14px',
    fontSize: '14.5px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    fontSize: '13.5px',
    color: '#374151',
    marginBottom: '6px',
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar Info Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0056D2, #0047B3)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 700, margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0,86,210,0.2)',
          }}>
            {(user.displayName || user.username || 'U')[0].toUpperCase()}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>
            {user.displayName || user.username}
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0' }}>{user.email}</p>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
            fontSize: '12px', fontWeight: 600, color: '#0056D2', background: '#EFF6FF',
          }}>
            {roleLabel}
          </span>
        </div>

        {/* Tab Selection menu */}
        <div style={{ ...cardStyle, padding: '12px' }}>
          <button
            onClick={() => { setActiveTab('info'); setMessage(null); }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '6px', border: 'none',
              textAlign: 'left', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === 'info' ? '#EFF6FF' : 'none',
              color: activeTab === 'info' ? '#0056D2' : '#4B5563',
              transition: 'all 0.15s',
              marginBottom: '4px',
            }}
          >
            👤 Thông tin hồ sơ
          </button>
          <button
            onClick={() => { setActiveTab('password'); setMessage(null); }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '6px', border: 'none',
              textAlign: 'left', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: activeTab === 'password' ? '#EFF6FF' : 'none',
              color: activeTab === 'password' ? '#0056D2' : '#4B5563',
              transition: 'all 0.15s',
            }}
          >
            🔑 Bảo mật & Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={cardStyle}>
        {message && (
          <div style={{
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
            borderRadius: '6px', padding: '14px 16px',
            color: message.type === 'success' ? '#065F46' : '#DC2626',
            fontSize: '14px', lineHeight: 1.5, marginBottom: '20px',
          }}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateProfile}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0' }}>
              Cập nhật thông tin hồ sơ
            </h2>

            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ ...labelStyle, color: '#9CA3AF' }}>Tên đăng nhập (Không thể thay đổi)</label>
                <input type="text" value={user.username} style={{ ...inputStyle, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} disabled />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#9CA3AF' }}>Địa chỉ Email (Không thể thay đổi)</label>
                <input type="email" value={user.email} style={{ ...inputStyle, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} disabled />
              </div>
            </div>

            <div style={{ maxWidth: '400px' }}>
              <label style={labelStyle}>Tên hiển thị</label>
              <input
                type="text"
                placeholder="Nhập tên hiển thị của bạn"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#0056D2'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '12px 24px', fontWeight: 700, fontSize: '14.5px',
                cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s',
                marginTop: '10px',
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0' }}>
              Bảo mật & Đổi mật khẩu
            </h2>

            <div>
              <label style={labelStyle}>Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu đang sử dụng"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#0056D2'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', margin: '8px 0 20px 0', paddingTop: '16px' }}>
              <label style={labelStyle}>Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#0056D2'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#0056D2'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '12px 24px', fontWeight: 700, fontSize: '14.5px',
                cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s',
                marginTop: '10px',
              }}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
