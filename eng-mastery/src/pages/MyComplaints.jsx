import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const COMPLAINT_TYPES = [
  { value: 'CONTENT_QUALITY', label: '📉 Chất lượng nội dung kém' },
  { value: 'MISLEADING', label: '⚠️ Thông tin sai lệch / Quảng cáo gian dối' },
  { value: 'REFUND_REQUEST', label: '💰 Yêu cầu hoàn tiền' },
  { value: 'TEACHER_BEHAVIOR', label: '🚫 Hành vi giảng viên không phù hợp' },
  { value: 'OTHER', label: '📝 Khác' },
];

const STATUS_CONFIG = {
  PENDING:   { label: 'Chờ xử lý',       bg: '#FEF3C7', color: '#92400E', icon: '⏳' },
  REVIEWING: { label: 'Đang xem xét',    bg: '#DBEAFE', color: '#1E40AF', icon: '🔍' },
  RESOLVED:  { label: 'Đã giải quyết',   bg: '#D1FAE5', color: '#065F46', icon: '✅' },
  REJECTED:  { label: 'Không chấp nhận', bg: '#FEE2E2', color: '#991B1B', icon: '❌' },
};

const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// ── Submit modal ──────────────────────────────────────────────────
const SubmitModal = ({ course, onClose, onSubmitted }) => {
  const [form, setForm] = useState({ title: '', content: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) { setError('Vui lòng chọn loại khiếu nại'); return; }
    if (form.content.length < 20) { setError('Nội dung tối thiểu 20 ký tự'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiFetch(`/api/complaints/courses/${course.id}`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Gửi khiếu nại thất bại'); return; }
      onSubmitted(data);
      onClose();
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', background: '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>🚨 Gửi khiếu nại</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{course.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '8px', color: '#DC2626', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Type */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
              Loại khiếu nại <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COMPLAINT_TYPES.map(t => (
                <label key={t.value} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                  padding: '10px 14px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: form.type === t.value ? '#DC2626' : '#E5E7EB',
                  background: form.type === t.value ? '#FEF2F2' : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" name="type" value={t.value} checked={form.type === t.value}
                    onChange={() => setForm(f => ({ ...f, type: t.value }))}
                    style={{ accentColor: '#DC2626' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: '#374151' }}>
              Tiêu đề <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              required maxLength={100}
              placeholder="Tóm tắt vấn đề bạn gặp phải..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#DC2626'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* Content */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: '#374151' }}>
              Mô tả chi tiết <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              required minLength={20} maxLength={2000}
              rows={5}
              placeholder="Mô tả rõ vấn đề bạn gặp phải, thời gian xảy ra, ảnh hưởng đến bạn như thế nào..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#DC2626'}
              onBlur={e => e.target.style.borderColor = '#D1D5DB'}
            />
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{form.content.length}/2000 ký tự (tối thiểu 20)</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', color: '#6B7280', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '12px', background: loading ? '#FCA5A5' : '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 700 }}>
              {loading ? 'Đang gửi...' : '🚨 Gửi khiếu nại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // expanded complaint
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // For quick submit from this page (we need to pick a course)
  // But this page is mainly to VIEW complaints; submit happens from CourseDetail/VideoLearning

  const fetchComplaints = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/api/complaints/my');
      if (!res.ok) throw new Error('Không thể tải danh sách khiếu nại');
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px' }}>Học viên</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>🚨 Khiếu nại của tôi</h1>
        </div>
        <button onClick={fetchComplaints} style={{ background: 'none', border: '1px solid #D1D5DB', color: '#374151', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
          🔄 Làm mới
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: '8px', color: '#065F46', marginBottom: '20px', fontSize: '14px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 16px', borderRadius: '8px', color: '#DC2626', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>⏳ Đang tải...</div>}

      {/* Empty */}
      {!loading && complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#F9FAFB', borderRadius: '12px', border: '2px dashed #E5E7EB' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Bạn chưa có khiếu nại nào</h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Để gửi khiếu nại, hãy vào trang khóa học bạn đã mua và nhấn nút "Khiếu nại".</p>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: '16px', color: '#0056D2', fontWeight: 600, textDecoration: 'none' }}>
            → Đến khóa học của tôi
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && complaints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complaints.map(c => {
            const status = STATUS_CONFIG[c.status] || { label: c.status, bg: '#F3F4F6', color: '#374151', icon: '?' };
            const isOpen = selected === c.id;
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Card header */}
                <div onClick={() => setSelected(isOpen ? null : c.id)} style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>#{c.id} — {c.title}</span>
                      <span style={{ background: status.bg, color: status.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                      📚 {c.courseTitle} &nbsp;·&nbsp; {c.typeName} &nbsp;·&nbsp; {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <span style={{ color: '#9CA3AF', fontSize: '12px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ paddingTop: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nội dung khiếu nại:</p>
                      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
                        {c.content}
                      </div>
                    </div>

                    {c.adminResponse && (
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                          Phản hồi từ Admin {c.handledByAdminName && <span style={{ fontWeight: 400, color: '#6B7280' }}>({c.handledByAdminName})</span>}:
                        </p>
                        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#1D4ED8', lineHeight: 1.6 }}>
                          {c.adminResponse}
                        </div>
                      </div>
                    )}

                    {!c.adminResponse && (
                      <p style={{ marginTop: '12px', color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>
                        Khiếu nại đang được xử lý. Chúng tôi sẽ phản hồi sớm nhất có thể.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;

// Export the modal separately for use in other pages
export { SubmitModal };
