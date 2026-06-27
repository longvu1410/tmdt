import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

// Emoji theo level để fallback nếu không có ảnh
const levelEmoji = {
  'Sơ cấp': '📗',
  'Trung cấp': '📘',
  'Nâng cao': '📕',
  'Mọi cấp độ': '🎙️',
};

// Format giá tiền VND
const formatPrice = (price) => {
  if (price === 0 || price === null || price === undefined) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const categories = [
  { name: 'IELTS', icon: '🎯', count: 24 },
  { name: 'TOEIC', icon: '📊', count: 18 },
  { name: 'Giao tiếp', icon: '💬', count: 32 },
  { name: 'Ngữ pháp', icon: '📖', count: 15 },
  { name: 'Phát âm', icon: '🎙️', count: 10 },
  { name: 'Viết', icon: '✍️', count: 12 },
];

// Skeleton card cho loading state
const CourseCardSkeleton = () => (
  <div style={{
    background: '#fff', borderRadius: '8px', overflow: 'hidden',
    border: '1px solid #E5E7EB',
  }}>
    <div style={{ height: '140px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '16px 20px 20px' }}>
      <div style={{ height: '12px', width: '60px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '10px' }} />
      <div style={{ height: '16px', width: '80%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '50%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', width: '40%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
        <div style={{ height: '16px', width: '30%', background: '#E5E7EB', borderRadius: '4px' }} />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch('/api/courses');
        if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải danh sách khóa học`);
        const data = await res.json();
        // Lấy tối đa 4 khóa học đầu tiên để hiển thị nổi bật
        const list = Array.isArray(data) ? data
          : data.content ?? data.data ?? data.courses ?? [];
        const top4 = list.slice(0, 4);

        // Gọi /api/courses/{id} song song để lấy thumbnailUrl cho từng khóa học
        const detailedCourses = await Promise.all(
          top4.map(async (course) => {
            try {
              const detailRes = await apiFetch(`/api/courses/${course.id}`);
              if (detailRes.ok) {
                const detail = await detailRes.json();
                return { ...course, thumbnailUrl: detail.thumbnailUrl, discountPrice: detail.discountPrice };

              }
            } catch (e) {
              console.warn(`Không lấy được chi tiết khóa học ${course.id}:`, e);
            }
            return course; // Giữ nguyên nếu không lấy được chi tiết
          })
        );

        setFeaturedCourses(detailedCourses);
      } catch (err) {
        console.error('Fetch courses error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div>
      {/* Hero Banner - Coursera style */}
      <div style={{
        background: 'linear-gradient(135deg, #0056D2 0%, #003F9E 100%)',
        padding: '64px 0',
        marginTop: '-32px',
        marginLeft: '-16px',
        marginRight: '-16px',
      }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#A7C7FF', fontSize: '14px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
              NỀN TẢNG HỌC TIẾNG ANH #1
            </p>
            <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: 700, lineHeight: 1.2, marginBottom: '20px' }}>
              Chinh phục tiếng Anh<br />cùng chuyên gia hàng đầu
            </h1>
            <p style={{ color: '#C5D9F7', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '520px' }}>
              Hơn 50+ khóa học chất lượng, được thiết kế bởi giảng viên dày dặn kinh nghiệm. Học mọi lúc, mọi nơi.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/dashboard" style={{
                background: '#fff', color: '#0056D2', padding: '14px 32px',
                borderRadius: '4px', fontWeight: 700, fontSize: '16px', border: 'none',
                display: 'inline-block',
              }}>
                Bắt đầu học miễn phí
              </Link>
              <Link to="/courses" style={{
                background: 'transparent', color: '#fff', padding: '14px 32px',
                borderRadius: '4px', fontWeight: 600, fontSize: '16px',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'inline-block', textDecoration: 'none',
              }}>
                Khám phá khóa học
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '32px', marginTop: '36px' }}>
              {[['10K+', 'Học viên'], ['50+', 'Khóa học'], ['4.8★', 'Đánh giá']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: 700 }}>{val}</div>
                  <div style={{ color: '#A7C7FF', fontSize: '13px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            width: '400px', height: '320px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '80px',
          }}>
            🎓
          </div>
        </div>
      </div>

      {/* Categories */}
      <section style={{ maxWidth: '1340px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Khám phá theo chủ đề</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          {categories.map(cat => (
            <div key={cat.name} style={{
              border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px 16px',
              textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0056D2'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,86,210,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{cat.name}</div>
              <div style={{ color: '#6B7280', fontSize: '13px' }}>{cat.count} khóa học</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ background: '#F9FAFB', padding: '48px 0' }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Khóa học nổi bật</h2>
              <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '15px' }}>Được đánh giá cao nhất bởi học viên</p>
            </div>
            <Link to="/courses" style={{ color: '#0056D2', fontWeight: 600, fontSize: '15px' }}>Xem tất cả →</Link>
          </div>

          {/* Error state */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
              padding: '16px 20px', color: '#DC2626', fontSize: '14px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* Loading skeleton */}
            {loading && [1, 2, 3, 4].map(i => <CourseCardSkeleton key={i} />)}

            {/* Courses từ API */}
            {!loading && featuredCourses.map(course => {
              const id            = course.id;
              const title         = course.title ?? course.name ?? 'Không có tên';
              const instructor    = course.instructorName ?? course.teacherName ?? course.instructor ?? '';
              const price         = course.price ?? course.tuitionFee ?? null;
              const discountPrice = course.discountPrice ?? null;
              const rating        = course.rating ?? course.averageRating ?? 0;
              const reviewCount   = course.totalReviews ?? course.reviewCount ?? course.reviews ?? 0;
              const level         = course.level ?? course.difficulty ?? '';
              const thumbnail     = course.thumbnailUrl ?? course.thumbnail ?? course.imageUrl ?? course.coverImage ?? null;
              const emoji         = levelEmoji[level] ?? '📚';


              return (
                <Link key={id} to={`/course/${id}`} style={{
                  background: '#fff', borderRadius: '8px', overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  display: 'block', textDecoration: 'none', color: 'inherit',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Thumbnail hoặc emoji fallback */}
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={title}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, #E8F1FF 0%, #D1E3FF 100%)',
                    display: thumbnail ? 'none' : 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px',
                  }}>{emoji}</div>

                  <div style={{ padding: '16px 20px 20px' }}>
                    {level && (
                      <div style={{ fontSize: '12px', color: '#0056D2', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {level}
                      </div>
                    )}
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>{title}</h3>
                    {instructor && (
                      <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>{instructor}</p>
                    )}
                    {rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                        <span style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 700 }}>{Number(rating).toFixed(1)}</span>
                        <span style={{ color: '#F59E0B', fontSize: '13px' }}>{'★'.repeat(Math.min(Math.floor(rating), 5))}</span>
                        {reviewCount > 0 && (
                          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>({Number(reviewCount).toLocaleString('vi-VN')})</span>
                        )}
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {discountPrice !== null && discountPrice >= 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '16px', color: '#DC2626' }}>{formatPrice(discountPrice)}</span>
                          <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '13px' }}>{formatPrice(price)}</span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{formatPrice(price)}</span>
                      )}
                    </div>

                  </div>
                </Link>
              );
            })}

            {/* Empty state nếu không có khóa học */}
            {!loading && !error && featuredCourses.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center', padding: '48px',
                color: '#6B7280', fontSize: '15px',
              }}>
                Chưa có khóa học nào. Hãy quay lại sau!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ maxWidth: '1340px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{
          background: '#F9FAFB', borderRadius: '12px', padding: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid #E5E7EB',
        }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Bắt đầu hành trình của bạn ngay hôm nay</h2>
            <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '500px' }}>Tham gia cùng hàng nghìn học viên đã chinh phục tiếng Anh thành công.</p>
          </div>
          <Link to="/dashboard" style={{
            background: '#0056D2', color: '#fff', padding: '14px 32px',
            borderRadius: '4px', fontWeight: 700, fontSize: '16px',
            display: 'inline-block', flexShrink: 0,
          }}>Đăng ký miễn phí</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;