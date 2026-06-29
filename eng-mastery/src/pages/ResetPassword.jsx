import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE from '../services/apiService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setSuccess(false);
      setMessage('Mã xác thực không hợp lệ hoặc đã thiếu. Vui lòng kiểm tra lại liên kết trong email.');
      return;
    }
    if (!password) {
      setSuccess(false);
      setMessage('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (password.length < 6) {
      setSuccess(false);
      setMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setSuccess(false);
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSuccess(false);
        setMessage(data.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        return;
      }
      setSuccess(true);
      setMessage('Mật khẩu của bạn đã được đặt lại thành công! Bạn có thể đóng trang này và đăng nhập lại bằng mật khẩu mới.');
    } catch {
      setSuccess(false);
      setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '460px',
    margin: '80px auto',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    fontSize: '14px',
    color: '#374151',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    height: '46px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    padding: '0 14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="6" fill="#0056D2" />
          <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">E</text>
        </svg>
        <span style={{ fontWeight: 700, fontSize: '20px', color: '#0056D2' }}>EngMastery</span>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
        Đặt lại mật khẩu
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: 1.5 }}>
        Vui lòng tạo một mật khẩu mới an toàn cho tài khoản của bạn.
      </p>

      {message && (
        <div style={{
          background: success ? '#ECFDF5' : '#FEF2F2',
          border: success ? '1px solid #A7F3D0' : '1px solid #FECACA',
          borderRadius: '6px',
          padding: '14px 16px',
          color: success ? '#065F46' : '#DC2626',
          fontSize: '14px',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}>
          {success ? '✅' : '⚠️'} {message}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              width: '100%',
              height: '48px',
              background: loading ? '#93C5FD' : '#0056D2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '10px',
            }}
          >
            {loading ? 'Đang thực hiện đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
