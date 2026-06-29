import React, { useState, useEffect } from 'react';
import API_BASE, { saveTokens } from '../services/apiService';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login', onAuthSuccess }) => {
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });

  // Register fields
  const [registerForm, setRegisterForm] = useState({
    username: '', name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT',
  });

  // Resend fields
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    setTab(defaultTab);
    setError('');
    setResendMessage('');
    setResendSuccess(false);
    setForgotEmail('');
    setForgotMessage('');
    setForgotSuccess(false);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.usernameOrEmail || !loginForm.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginForm.usernameOrEmail,
          password: loginForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }
      // Lưu tokens qua apiService
      saveTokens(data);
      onAuthSuccess(data);
      onClose();
    } catch {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username,
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        return;
      }
      
      // Chuyển sang tab gửi lại xác thực
      const registeredEmail = registerForm.email;
      setResendEmail(registeredEmail);
      setTab('resend-verification');
      setResendSuccess(true);
      setResendMessage('Đăng ký tài khoản thành công! Một email kích hoạt đã được gửi tới hộp thư của bạn. Vui lòng kiểm tra email để xác thực tài khoản.');
      setError('');
    } catch {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Vui lòng nhập email.');
      return;
    }
    setLoading(true);
    setError('');
    setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotSuccess(false);
        setForgotMessage(data.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại.');
        return;
      }
      setForgotSuccess(true);
      setForgotMessage('Yêu cầu thành công! Vui lòng kiểm tra hộp thư của bạn để lấy liên kết đặt lại mật khẩu.');
    } catch {
      setForgotSuccess(false);
      setForgotMessage('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setError('Vui lòng nhập email.');
      return;
    }
    setLoading(true);
    setError('');
    setResendMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Gửi lại email kích hoạt thất bại.');
        return;
      }
      setResendSuccess(true);
      setResendMessage('Gửi lại email xác thực thành công! Vui lòng kiểm tra hộp thư của bạn.');
    } catch {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: '48px', border: '1px solid #D1D5DB', borderRadius: '4px',
    padding: '0 14px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontWeight: 600, fontSize: '14px',
    color: '#374151', marginBottom: '6px',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 2000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '460px',
        zIndex: 2001, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 0', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'none', border: 'none', fontSize: '22px',
              color: '#9CA3AF', cursor: 'pointer', lineHeight: 1,
            }}
          >×</button>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="4" fill="#0056D2" />
              <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">E</text>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#0056D2' }}>EngMastery</span>
          </div>

          {/* Tabs */}
          {tab !== 'resend-verification' && tab !== 'forgot-password' ? (
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                  flex: 1, padding: '12px', fontWeight: 600, fontSize: '15px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tab === t ? '#0056D2' : '#6B7280',
                  borderBottom: tab === t ? '2px solid #0056D2' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>
          ) : tab === 'resend-verification' ? (
            <div style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: '16px', color: '#374151' }}>
              Gửi lại email kích hoạt
            </div>
          ) : (
            <div style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: '16px', color: '#374151' }}>
              Quên mật khẩu
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px 32px' }}>
          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px',
              padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px',
            }}>
              ⚠️ {error === 'Please verify your email before logging in' ? 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực tài khoản.' : error}
              {error === 'Please verify your email before logging in' && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const isEmail = loginForm.usernameOrEmail.includes('@');
                      setResendEmail(isEmail ? loginForm.usernameOrEmail : '');
                      setTab('resend-verification');
                      setError('');
                      setResendMessage('');
                      setResendSuccess(false);
                    }}
                    style={{
                      color: '#0056D2', fontWeight: 600, background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '13px', padding: 0, textDecoration: 'underline'
                    }}
                  >
                    Gửi lại email kích hoạt ngay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Tên đăng nhập hoặc Email</label>
                <input
                  type="text"
                  placeholder="username hoặc email@example.com"
                  value={loginForm.usernameOrEmail}
                  onChange={e => setLoginForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setTab('forgot-password'); setError(''); }}
                  style={{ color: '#0056D2', fontSize: '13px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', height: '48px', background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '4px',
                fontWeight: 700, fontSize: '16px', cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s',
              }}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6B7280' }}>
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => { setTab('register'); setError(''); }}
                  style={{ color: '#0056D2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  Đăng ký ngay
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {tab === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit}>
              {forgotMessage && (
                <div style={{
                  background: forgotSuccess ? '#ECFDF5' : '#FEF2F2',
                  border: forgotSuccess ? '1px solid #A7F3D0' : '1px solid #FECACA',
                  borderRadius: '4px',
                  padding: '12px 16px', marginBottom: '16px',
                  color: forgotSuccess ? '#059669' : '#DC2626', fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {forgotSuccess ? '✅' : '⚠️'} {forgotMessage}
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '16px' }}>
                  Nhập địa chỉ email đăng ký của bạn. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu đến email này.
                </p>
                <label style={labelStyle}>Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  required
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', height: '48px', background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '4px',
                fontWeight: 700, fontSize: '16px', cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s',
                marginBottom: '16px'
              }}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
              </button>
              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                <button type="button" onClick={() => { setTab('login'); setError(''); setForgotMessage(''); }}
                  style={{ color: '#0056D2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={registerForm.username}
                  onChange={e => setRegisterForm(f => ({ ...f, username: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Họ và tên</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={registerForm.confirmPassword}
                  onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
              </div>
              {/* Role Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Bạn là</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { value: 'STUDENT', icon: '🎓', label: 'Học viên', desc: 'Đăng ký để học' },
                    { value: 'TEACHER', icon: '👨‍🏫', label: 'Giảng viên', desc: 'Đăng ký để dạy' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRegisterForm(f => ({ ...f, role: opt.value }))}
                      style={{
                        flex: 1, padding: '14px 12px', borderRadius: '6px', cursor: 'pointer',
                        border: registerForm.role === opt.value ? '2px solid #0056D2' : '2px solid #E5E7EB',
                        background: registerForm.role === opt.value ? '#E8F1FF' : '#fff',
                        textAlign: 'center', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{opt.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: registerForm.role === opt.value ? '#0056D2' : '#374151' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', height: '48px', background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '4px',
                fontWeight: 700, fontSize: '16px', cursor: loading ? 'wait' : 'pointer',
              }}>
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#6B7280' }}>
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => { setTab('login'); setError(''); }}
                  style={{ color: '#0056D2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* RESEND VERIFICATION FORM */}
          {tab === 'resend-verification' && (
            <form onSubmit={handleResendSubmit}>
              {resendMessage && (
                <div style={{
                  background: resendSuccess ? '#ECFDF5' : '#FEF2F2',
                  border: resendSuccess ? '1px solid #A7F3D0' : '1px solid #FECACA',
                  borderRadius: '4px',
                  padding: '12px 16px', marginBottom: '16px',
                  color: resendSuccess ? '#059669' : '#DC2626', fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {resendSuccess ? '✅' : '⚠️'} {resendMessage}
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '16px' }}>
                  Nhập địa chỉ email đăng ký của bạn để hệ thống gửi lại liên kết xác thực tài khoản.
                </p>
                <label style={labelStyle}>Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  required
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', height: '48px', background: loading ? '#93C5FD' : '#0056D2',
                color: '#fff', border: 'none', borderRadius: '4px',
                fontWeight: 700, fontSize: '16px', cursor: loading ? 'wait' : 'pointer',
                transition: 'background 0.2s',
                marginBottom: '16px'
              }}>
                {loading ? 'Đang gửi...' : 'Gửi lại email kích hoạt'}
              </button>
              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                <button type="button" onClick={() => { setTab('login'); setError(''); setResendMessage(''); }}
                  style={{ color: '#0056D2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
