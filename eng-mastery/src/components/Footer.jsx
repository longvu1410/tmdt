import React from 'react';

const Footer = () => {
  const linkStyle = { color: '#6B7280', fontSize: '14px', display: 'block', marginBottom: '10px', transition: 'color 0.15s' };
  const headingStyle = { fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <footer style={{ background: '#111827', color: '#fff' }}>
      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="28" height="28" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0056D2"/><text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">E</text></svg>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>EngMastery</span>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.7, maxWidth: '300px' }}>
              Nền tảng học tiếng Anh trực tuyến hàng đầu, giúp bạn chinh phục mục tiêu ngoại ngữ dễ dàng và hiệu quả.
            </p>
          </div>
          {/* Khóa học */}
          <div>
            <h4 style={headingStyle}>Khóa học</h4>
            <a href="#" style={linkStyle}>IELTS Foundation</a>
            <a href="#" style={linkStyle}>TOEIC 800+</a>
            <a href="#" style={linkStyle}>Giao tiếp công sở</a>
            <a href="#" style={linkStyle}>Phát âm chuẩn</a>
          </div>
          {/* Hỗ trợ */}
          <div>
            <h4 style={headingStyle}>Hỗ trợ</h4>
            <a href="#" style={linkStyle}>Trung tâm trợ giúp</a>
            <a href="#" style={linkStyle}>Câu hỏi thường gặp</a>
            <a href="#" style={linkStyle}>Liên hệ kỹ thuật</a>
            <a href="#" style={linkStyle}>Chính sách bảo mật</a>
          </div>
          {/* Liên hệ */}
          <div>
            <h4 style={headingStyle}>Liên hệ</h4>
            <p style={{ ...linkStyle, cursor: 'default' }}>📍 123 Đường Tự Do, TP.HCM</p>
            <p style={{ ...linkStyle, cursor: 'default' }}>📞 1900 1000</p>
            <p style={{ ...linkStyle, cursor: 'default' }}>✉️ hotro@engmastery.vn</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6B7280', fontSize: '13px' }}>© 2026 EngMastery. Đã đăng ký bản quyền.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Điều khoản', 'Bảo mật', 'Cookie'].map(t => (
              <a key={t} href="#" style={{ color: '#6B7280', fontSize: '13px' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;