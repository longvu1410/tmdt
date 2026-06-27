import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const statusConfig = {
  APPROVED: { label: 'Đã duyệt', bg: '#D1FAE5', color: '#065F46', icon: '✅' },
  PENDING: { label: 'Chờ duyệt', bg: '#FEF3C7', color: '#92400E', icon: '⏳' },
  REJECTED: { label: 'Bị từ chối', bg: '#FEE2E2', color: '#991B1B', icon: '❌' },
};

const TeacherCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/courses/my-courses');
        if (!res.ok) throw new Error('Không thể tải danh sách khóa học');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const formatCurrency = (val) => (val || 0).toLocaleString('vi-VN') + ' ₫';
  const formatDate = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px' }}>Giảng viên</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>📚 Khóa học của tôi</h1>
        </div>
        <Link to="/create-course" style={{
          background: '#0056D2', color: '#fff', padding: '10px 22px',
          borderRadius: '6px', fontWeight: 600, fontSize: '14px', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          + Tạo khóa học mới
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 16px', borderRadius: '8px', color: '#DC2626', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          Đang tải danh sách khóa học...
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#F9FAFB', borderRadius: '12px', border: '2px dashed #E5E7EB',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
          <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>Bạn chưa có khóa học nào</h2>
          <p style={{ color: '#6B7280', marginBottom: '20px' }}>Hãy tạo khóa học đầu tiên để bắt đầu giảng dạy!</p>
          <Link to="/create-course" style={{
            display: 'inline-block', background: '#0056D2', color: '#fff',
            padding: '12px 28px', borderRadius: '6px', fontWeight: 600, textDecoration: 'none',
          }}>
            🚀 Tạo khóa học ngay
          </Link>
        </div>
      )}

      {/* Course list */}
      {!loading && courses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courses.map(course => {
            const status = statusConfig[course.status] || { label: course.status, bg: '#F3F4F6', color: '#374151', icon: '?' };
            return (
              <div key={course.id} style={{
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
                padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '130px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden',
                  background: course.thumbnailUrl ? `url(${course.thumbnailUrl}) center/cover` : 'linear-gradient(135deg,#E8F1FF,#D1E3FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                }}>
                  {!course.thumbnailUrl && '🖼️'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '16px', margin: 0, color: '#111827' }}>
                      {course.title}
                    </h3>
                    <span style={{
                      background: status.bg, color: status.color,
                      padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                    }}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {course.rejectionReason && (
                    <div style={{
                      background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px',
                      padding: '8px 12px', marginBottom: '8px', fontSize: '13px', color: '#991B1B',
                    }}>
                      <strong>Lý do từ chối:</strong> {course.rejectionReason}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#6B7280', fontSize: '13px' }}>
                    <span>💰 {formatCurrency(course.price)}</span>
                    <span>👥 {course.studentCount || 0} học viên</span>
                    <span>📅 {formatDate(course.createdAt)}</span>
                    <span style={{ textTransform: 'capitalize' }}>📊 {course.level?.toLowerCase()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/teacher/edit-course/${course.id}`)}
                    style={{
                      padding: '8px 18px', background: '#EFF6FF', color: '#0056D2',
                      border: '1px solid #BFDBFE', borderRadius: '6px',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  {course.status === 'APPROVED' && (
                    <Link to={`/course/${course.id}`} style={{
                      padding: '8px 18px', background: '#F0FDF4', color: '#059669',
                      border: '1px solid #A7F3D0', borderRadius: '6px',
                      fontWeight: 600, fontSize: '13px', textDecoration: 'none', textAlign: 'center',
                    }}>
                      👁️ Xem trang
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
