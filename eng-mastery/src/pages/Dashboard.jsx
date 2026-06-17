import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const formatPrice = (v) => {
  if (v === 0 || v == null) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
};

// ── Skeleton card ──
const SkeletonCard = () => (
  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <div style={{
        width: '220px', flexShrink: 0, minHeight: '140px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ flex: 1, padding: '20px 24px' }}>
        <div style={{ height: '18px', width: '60%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ height: '13px', width: '35%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '20px' }} />
        <div style={{ height: '6px', width: '100%', background: '#E5E7EB', borderRadius: '3px' }} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  // Lấy đơn hàng PAID/COMPLETED → fetch chi tiết course để lấy thumbnail
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch('/api/orders/my');
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content ?? data.data ?? [];

        // Chỉ lấy các đơn đã thanh toán
        const paidOrders = list.filter(o =>
          ['PAID', 'COMPLETED'].includes(o.status?.toUpperCase())
        );

        // Fetch chi tiết từng course để lấy thumbnail
        const coursesWithDetails = await Promise.all(
          paidOrders.map(async (order) => {
            let thumbnail = null;
            let instructorName = '';
            let level = '';
            let lessonCount = 0;
            try {
              const cRes = await apiFetch(`/api/courses/${order.courseId}`);
              if (cRes.ok) {
                const cData = await cRes.json();
                thumbnail = cData.thumbnailUrl ?? cData.thumbnail ?? null;
                instructorName = cData.instructorName ?? cData.teacherName ?? '';
                level = cData.level ?? '';
                lessonCount = cData.lessonCount ?? 0;
              }
            } catch { /* silent */ }

            return {
              courseId: order.courseId,
              courseTitle: order.courseTitle || `Khóa học #${order.courseId}`,
              courseSlug: order.courseSlug,
              thumbnail,
              instructorName,
              level,
              lessonCount,
              paidAt: order.paidAt,
              totalAmount: order.totalAmount,
            };
          })
        );

        setMyCourses(coursesWithDetails);
      } catch (err) {
        console.error('Fetch my courses error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const levelLabel = {
    BEGINNER: 'Sơ cấp', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao',
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>
            Xin chào {user?.displayName || user?.username || ''} 👋
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Khóa học của tôi</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/orders" style={{
            color: '#0056D2', fontWeight: 600, fontSize: '14px',
            padding: '8px 16px', border: '1px solid #0056D2', borderRadius: '6px',
          }}>📦 Đơn hàng</Link>
          <Link to="/" style={{
            color: '#fff', background: '#0056D2', fontWeight: 600, fontSize: '14px',
            padding: '8px 16px', borderRadius: '6px',
          }}>Khám phá thêm →</Link>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Khóa học đã mua', value: myCourses.length, icon: '📚', color: '#0056D2', bg: '#EFF6FF' },
            { label: 'Tổng đầu tư', value: formatPrice(myCourses.reduce((s, c) => s + (c.totalAmount || 0), 0)), icon: '💰', color: '#059669', bg: '#ECFDF5' },
            { label: 'Tổng bài học', value: myCourses.reduce((s, c) => s + (c.lessonCount || 0), 0), icon: '📝', color: '#7C3AED', bg: '#F5F3FF' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg, border: '1px solid #E5E7EB', borderRadius: '10px',
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>{stat.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
          padding: '16px 20px', color: '#DC2626', fontSize: '14px', marginBottom: '16px',
        }}>⚠️ {error}</div>
      )}

      {/* Course List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading && [1, 2, 3].map(i => <SkeletonCard key={i} />)}

        {!loading && myCourses.map(course => (
          <div key={course.courseId} style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
            overflow: 'hidden', transition: 'box-shadow 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Course thumbnail */}
              <Link to={`/course/${course.courseId}`} style={{ width: '220px', flexShrink: 0, display: 'block' }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.courseTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '140px' }}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{
                  width: '100%', minHeight: '140px',
                  background: 'linear-gradient(135deg, #E8F1FF 0%, #D1E3FF 100%)',
                  display: course.thumbnail ? 'none' : 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '48px',
                }}>📘</div>
              </Link>

              {/* Course info */}
              <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{course.courseTitle}</h3>
                  {course.level && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      color: '#0056D2', background: '#EFF6FF', padding: '2px 8px',
                      borderRadius: '10px', letterSpacing: '0.5px',
                    }}>{levelLabel[course.level] || course.level}</span>
                  )}
                </div>

                {course.instructorName && (
                  <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>
                    👨‍🏫 {course.instructorName}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#9CA3AF' }}>
                  {course.lessonCount > 0 && (
                    <span>📝 {course.lessonCount} bài học</span>
                  )}
                  {course.paidAt && (
                    <span>✓ Mua ngày {new Date(course.paidAt).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                gap: '8px', padding: '20px 24px', borderLeft: '1px solid #F3F4F6',
              }}>
                <Link to={`/learn/${course.courseId}`} style={{
                  background: '#0056D2', color: '#fff', padding: '10px 24px',
                  borderRadius: '6px', fontWeight: 600, fontSize: '14px', textAlign: 'center',
                  whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0047B3'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0056D2'}
                >▶ Vào học</Link>
                <Link to={`/course/${course.courseId}`} style={{
                  color: '#0056D2', fontSize: '13px', fontWeight: 500, textAlign: 'center',
                  padding: '6px',
                }}>📄 Xem chi tiết</Link>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!loading && !error && myCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Bạn chưa có khóa học nào
            </p>
            <p style={{ fontSize: '15px', marginBottom: '24px' }}>
              Mua khóa học và bắt đầu hành trình học tập của bạn!
            </p>
            <Link to="/" style={{
              background: '#0056D2', color: '#fff', padding: '12px 32px',
              borderRadius: '6px', fontWeight: 700, fontSize: '15px',
              display: 'inline-block',
            }}>Khám phá khóa học →</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;