import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API_BASE, { saveTokens } from '../services/apiService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const token = searchParams.get('token');
  const hasCalledRef = useRef(false); // Chặn gọi API 2 lần do React Strict Mode

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Token xác thực không hợp lệ.');
      return;
    }

    // Nếu đã gọi rồi thì bỏ qua (React Strict Mode unmount/remount)
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const verifyAndLogin = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setError(data.message || 'Xác thực email thất bại. Token có thể đã hết hạn.');
          return;
        }

        // Nếu backend trả về tokens → tự động đăng nhập
        if (data.accessToken) {
          saveTokens(data);
        }

        setStatus('success');

        // Chuyển hướng về trang chủ sau 2 giây
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch {
        setStatus('error');
        setError('Không thể kết nối đến server. Vui lòng thử lại.');
      }
    };

    verifyAndLogin();
  }, [token]);


  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
        padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Đang xác thực email...</h1>
            <p style={{ color: '#6B7280', fontSize: '15px' }}>Vui lòng chờ trong giây lát.</p>
            {/* Spinner */}
            <div style={{
              width: '40px', height: '40px', border: '4px solid #E5E7EB',
              borderTop: '4px solid #0056D2', borderRadius: '50%',
              margin: '24px auto 0',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#ECFDF5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px',
            }}>✅</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#065F46' }}>
              Xác thực thành công!
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>
              Email của bạn đã được xác thực. Đang tự động đăng nhập và chuyển hướng...
            </p>
            <div style={{
              height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: '#0056D2', borderRadius: '2px',
                animation: 'progress 2s linear forwards',
              }} />
            </div>
            <style>{`@keyframes progress { from { width: 0; } to { width: 100%; } }`}</style>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#FEF2F2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px',
            }}>❌</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#991B1B' }}>
              Xác thực thất bại
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 32px', background: '#0056D2', color: '#fff',
                border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '15px',
                cursor: 'pointer',
              }}
            >Về trang chủ</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
