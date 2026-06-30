import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getAccessToken } from '../services/apiService';
import { addToCart, isInCart } from '../services/cartUtils';

const levelLabel = {
  BEGINNER: 'Sơ cấp', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao',
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ color: '#F59E0B', fontSize: '14px', letterSpacing: '1px' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCart, setInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // ── Reviews state ──
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHover, setReviewHover] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null); // { type, text }
  const [hasReviewed, setHasReviewed] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  // Kiểm tra xem khóa học đã có trong giỏ chưa
  useEffect(() => {
    if (id) setInCart(isInCart(Number(id)));
  }, [id]);

  // Kiểm tra đã mua khóa học chưa (gọi /api/orders/my)
  useEffect(() => {
    if (!id || !getAccessToken()) return;
    const checkPurchased = async () => {
      try {
        const res = await apiFetch('/api/orders/my');
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content ?? data.data ?? [];
        const bought = list.some(o =>
          o.courseId === Number(id) &&
          ['PAID', 'COMPLETED'].includes(o.status?.toUpperCase())
        );
        setIsPurchased(bought);
      } catch { /* silent */ }
    };
    checkPurchased();
  }, [id]);

  const handleAddToCart = () => {
    // Chưa đăng nhập
    if (!getAccessToken()) {
      setCartMsg({ type: 'error', text: 'Vui lòng đăng nhập để thêm vào giỏ hàng.' });
      setTimeout(() => setCartMsg(null), 3000);
      return;
    }
    // Đã trong giỏ → chuyển thẳng sang trang giỏ
    if (inCart) {
      navigate('/cart');
      return;
    }
    setAddingToCart(true);
    setCartMsg(null);

    // Lưu vào localStorage (không cần gọi API)
    const result = addToCart({
      courseId:       Number(id),
      courseTitle:    course?.title ?? '',
      courseSlug:     course?.slug ?? '',
      price:          (course?.isDiscountActive && course?.discountPrice !== null && course?.discountPrice !== undefined) ? course.discountPrice : (course?.price ?? 0),
      thumbnailUrl:   course?.thumbnailUrl ?? null,
      instructorName: course?.instructorName ?? '',
      level:          course?.level ?? '',
    });


    setAddingToCart(false);

    if (result.added) {
      setInCart(true);
      setCartMsg({ type: 'success', text: 'Đã thêm vào giỏ hàng!' });
      setTimeout(() => navigate('/cart'), 800);
    } else {
      // already_in_cart
      setInCart(true);
      setCartMsg({ type: 'success', text: 'Khóa học đã có trong giỏ hàng!' });
      setTimeout(() => navigate('/cart'), 800);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/courses/${id}`);
        if (!res.ok) { setError('Không tìm thấy khóa học.'); return; }
        const data = await res.json();
        setCourse(data);
      } catch {
        setError('Không thể kết nối đến server.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Fetch reviews — fallback sang course.reviews nếu API riêng không có
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await apiFetch(`/api/courses/${id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.content ?? data.data ?? [];
          setReviews(list);
          if (user) {
            const mine = list.some(r =>
              r.studentId === user.id || r.studentName === (user.displayName || user.username)
            );
            setHasReviewed(mine);
          }
          setReviewsLoading(false);
          return; // Thành công → không cần fallback
        }

      } catch { /* API chưa có → fallback */ }

      // Fallback: lấy từ course.reviews (nếu có trong response chi tiết)
      if (course?.reviews?.length > 0) {
        setReviews(course.reviews);
        if (user) {
          const mine = course.reviews.some(r =>
            r.studentId === user.id || r.studentName === (user.displayName || user.username)
          );
          setHasReviewed(mine);
        }
      }

      setReviewsLoading(false);
    };
    fetchReviews();
  }, [id, course]);

  // Gửi review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewMsg({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá.' });
      setTimeout(() => setReviewMsg(null), 3000);
      return;
    }
    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await apiFetch(`/api/courses/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const text = await res.text();
      const body = text ? JSON.parse(text) : {};
      if (res.ok) {
        setReviewMsg({ type: 'success', text: 'Gửi đánh giá thành công!' });
        setHasReviewed(true);
        setReviewComment('');
        setReviewRating(5);
        // Thêm review mới vào đầu danh sách
        setReviews(prev => [{
          ...body,
          studentName: user?.displayName || user?.username || 'Bạn',
          rating: reviewRating,
          comment: reviewComment.trim(),
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setTimeout(() => setReviewMsg(null), 3000);
      } else {
        const statusMsg = {
          400: 'Dữ liệu không hợp lệ.',
          403: 'Bạn cần mua khóa học để đánh giá.',
          409: 'Bạn đã đánh giá khóa học này rồi.',
        }[res.status];
        setReviewMsg({ type: 'error', text: body.message || statusMsg || `Lỗi ${res.status}` });
        if (res.status === 409) setHasReviewed(true);
        setTimeout(() => setReviewMsg(null), 5000);
      }
    } catch {
      setReviewMsg({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
      setTimeout(() => setReviewMsg(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Loading ──
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #E5E7EB', borderTop: '4px solid #0056D2', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6B7280' }}>Đang tải khóa học...</p>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
      <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>{error}</h2>
      <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '10px 24px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Về trang chủ</button>
    </div>
  );

  const hasDiscount = course.isDiscountActive && course.discountPrice !== null && course.discountPrice !== undefined && course.discountPrice >= 0;
  const priceFormatted = course.price?.toLocaleString('vi-VN') + 'đ';


  return (
    <div>
      {/* ── Top dark banner ── */}
      <div style={{ background: '#1F2937', margin: '-32px -16px 0', padding: '40px 0 48px' }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '40px' }}>
          <div style={{ flex: 1, color: '#fff' }}>
            <p style={{ color: '#A7C7FF', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              {levelLabel[course.level] || course.level}
            </p>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '14px', lineHeight: 1.3 }}>{course.title}</h1>
            <p style={{ color: '#D1D5DB', fontSize: '15px', lineHeight: 1.6, marginBottom: '18px', maxWidth: '620px' }}>{course.description}</p>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '15px' }}>{course.rating?.toFixed(1)}</span>
              <StarRating rating={course.rating || 0} />
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>({course.ratingCount?.toLocaleString()} đánh giá)</span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>•</span>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{course.studentCount?.toLocaleString()} học viên</span>
            </div>

            <p style={{ color: '#D1D5DB', fontSize: '14px', marginBottom: '14px' }}>
              Giảng viên: <span style={{ color: '#93C5FD' }}>{course.instructorName}</span>
            </p>

            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#9CA3AF' }}>
              <span>🌐 {course.language}</span>
              <span>📝 {course.lessonCount} bài học</span>
              <span>⏱️ {course.totalDuration}</span>
              {course.status && (
                <span style={{ color: course.status === 'APPROVED' ? '#34D399' : '#F87171' }}>
                  {course.status === 'APPROVED' ? '✓ Đã duyệt' : course.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* ── Left content ── */}
        <div style={{ flex: 1 }}>

          {/* Outcomes */}
          {course.outcomes?.length > 0 && (
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Bạn sẽ học được gì</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {course.outcomes.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#0056D2', flexShrink: 0 }}>✓</span> {o}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {course.sections?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Nội dung khóa học</h2>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>
                {course.sections.length} chương • {course.lessonCount} bài học • {course.totalDuration}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {course.sections.map((sec, i) => {
                  const isExpanded = !!expandedSections[i];
                  const hasDescription = sec.description && sec.description.trim();
                  const hasSkills = sec.skills && sec.skills.length > 0;
                  const isLast = i === course.sections.length - 1;
                  const isFirst = i === 0;
                  return (
                    <div key={i} style={{
                      border: '1px solid #E5E7EB',
                      borderBottom: isLast || isExpanded ? '1px solid #E5E7EB' : 'none',
                      borderRadius: isFirst && isLast ? '8px'
                        : isFirst ? '8px 8px 0 0'
                        : isLast ? '0 0 8px 8px'
                        : '0',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s',
                      boxShadow: isExpanded ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    }}>
                      {/* Section Header */}
                      <div
                        onClick={() => setExpandedSections(prev => ({ ...prev, [i]: !prev[i] }))}
                        style={{
                          padding: '14px 20px',
                          background: isExpanded ? '#EFF6FF' : (i % 2 === 0 ? '#F9FAFB' : '#fff'),
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          cursor: 'pointer', transition: 'background 0.2s',
                          userSelect: 'none',
                        }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#F3F4F6'; }}
                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = isExpanded ? '#EFF6FF' : (i % 2 === 0 ? '#F9FAFB' : '#fff'); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            color: isExpanded ? '#0056D2' : '#9CA3AF',
                            fontSize: '13px', transition: 'transform 0.2s, color 0.2s',
                            display: 'inline-block',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}>▸</span>
                          <span style={{
                            fontWeight: isExpanded ? 700 : 600, fontSize: '14px',
                            color: isExpanded ? '#0056D2' : '#111827',
                          }}>{sec.title}</span>
                        </div>
                        <span style={{ color: '#6B7280', fontSize: '13px', flexShrink: 0 }}>
                          {sec.lessonCount} bài • {sec.duration}
                        </span>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div style={{
                          padding: '16px 20px', borderTop: '1px solid #E5E7EB',
                          background: '#fff',
                        }}>
                          {hasDescription && (
                            <div style={{ marginBottom: hasSkills ? '14px' : 0 }}>
                              <p style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                                📝 Mô tả
                              </p>
                              <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                                {sec.description}
                              </p>
                            </div>
                          )}
                          {hasSkills && (
                            <div>
                              <p style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                                🎯 Kỹ năng
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {sec.skills.map((skill, si) => (
                                  <span key={si} style={{
                                    background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px',
                                    borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                                    border: '1px solid #BFDBFE',
                                  }}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {!hasDescription && !hasSkills && (
                            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
                              Chưa có thông tin chi tiết cho chương này.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefits */}
          {course.benefits?.length > 0 && (
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>Khóa học bao gồm</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {course.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#0056D2', flexShrink: 0 }}>✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Đánh giá từ học viên
              <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                ({reviews.length || course.ratingCount || 0} đánh giá)
              </span>
            </h2>

            {/* Form viết review — chỉ hiện khi đã mua và chưa review */}
            {isPurchased && !hasReviewed && (
              <form onSubmit={handleSubmitReview} style={{
                background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px',
                padding: '20px 24px', marginBottom: '20px',
              }}>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px' }}>
                  ✨ Chia sẻ trải nghiệm của bạn
                </p>

                {/* Star rating selector */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '28px', padding: '2px', transition: 'transform 0.15s',
                        transform: (reviewHover || reviewRating) >= star ? 'scale(1.15)' : 'scale(1)',
                        color: (reviewHover || reviewRating) >= star ? '#F59E0B' : '#D1D5DB',
                      }}
                    >★</button>
                  ))}
                  <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>
                    {reviewRating}/5
                  </span>
                </div>

                {/* Comment textarea */}
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Viết nhận xét về khóa học..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#0056D2'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />

                {/* Review message */}
                {reviewMsg && (
                  <div style={{
                    padding: '8px 14px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 600, marginTop: '10px', textAlign: 'center',
                    background: reviewMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: reviewMsg.type === 'success' ? '#065F46' : '#DC2626',
                  }}>
                    {reviewMsg.type === 'success' ? '✓ ' : '⚠️ '}{reviewMsg.text}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    style={{
                      padding: '10px 24px', borderRadius: '6px', fontWeight: 700,
                      fontSize: '14px', border: 'none', cursor: submittingReview ? 'not-allowed' : 'pointer',
                      background: submittingReview ? '#6B9FE8' : '#0056D2',
                      color: '#fff', transition: 'background 0.2s',
                    }}
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            )}

            {/* Đã review */}
            {isPurchased && hasReviewed && (
              <div style={{
                background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '8px',
                padding: '14px 20px', marginBottom: '20px', fontSize: '14px',
                color: '#065F46', fontWeight: 600, textAlign: 'center',
              }}>
                ✓ Bạn đã đánh giá khóa học này. Cảm ơn bạn!
              </div>
            )}

            {/* Loading reviews */}
            {reviewsLoading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '14px' }}>
                Đang tải đánh giá...
              </div>
            )}

            {/* Danh sách reviews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev, i) => (
                <div key={rev.id ?? i} style={{
                  background: '#fff', padding: '20px', borderRadius: '10px',
                  border: '1px solid #E5E7EB', transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#0056D2', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '15px', flexShrink: 0,
                    }}>
                      {(rev.studentName || 'H')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                        {rev.studentName || 'Học viên'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRating rating={rev.rating || 5} />
                        {rev.createdAt && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.7 }}>{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Empty reviews */}
            {!reviewsLoading && reviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', fontSize: '14px' }}>
                Chưa có đánh giá nào.
                {isPurchased && !hasReviewed && ' Hãy là người đầu tiên đánh giá khóa học này!'}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ width: '340px', flexShrink: 0, position: 'sticky', top: '80px' }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            {/* Thumbnail */}
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title}
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ height: '180px', background: 'linear-gradient(135deg,#E8F1FF,#D1E3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>📘</div>
            )}

            <div style={{ padding: '20px 24px' }}>
              {hasDiscount ? (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '30px', fontWeight: 700, color: '#DC2626' }}>{course.discountPrice.toLocaleString('vi-VN') + 'đ'}</span>
                    <span style={{ fontSize: '16px', textDecoration: 'line-through', color: '#9CA3AF' }}>{priceFormatted}</span>
                  </div>
                  <div style={{ display: 'inline-block', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>
                    🏷️ TIẾT KIỆM {Math.round((1 - course.discountPrice / course.price) * 100)}%
                  </div>
                  {course.discountEndAt && (
                    <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏳ Kết thúc: {new Date(course.discountEndAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '30px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{priceFormatted}</p>
              )}


              {/* Cart message */}
              {cartMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
                  fontWeight: 600, marginBottom: '10px', textAlign: 'center',
                  background: cartMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color:      cartMsg.type === 'success' ? '#065F46'  : '#DC2626',
                  border: `1px solid ${cartMsg.type === 'success' ? '#6EE7B7' : '#FECACA'}`,
                }}>
                  {cartMsg.type === 'success' ? '✓ ' : '⚠️ '}{cartMsg.text}
                </div>
              )}

              {/* Nếu đã mua: hiện nút "Vào học ngay", ẩn giỏ hàng */}
              {isPurchased ? (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 600, marginBottom: '10px', textAlign: 'center',
                    background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7',
                  }}>
                    ✓ Bạn đã sở hữu khóa học này
                  </div>
                  <Link to={`/learn/${id}`} style={{
                    display: 'block', width: '100%', padding: '13px',
                    background: '#059669', color: '#fff', border: 'none', borderRadius: '4px',
                    fontWeight: 700, fontSize: '15px', marginBottom: '10px',
                    textAlign: 'center', boxSizing: 'border-box',
                  }}>
                    ▶ Vào học ngay
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  style={{
                    width: '100%', padding: '13px',
                    background: inCart ? '#059669' : addingToCart ? '#6B9FE8' : '#0056D2',
                    color: '#fff', border: 'none', borderRadius: '4px',
                    fontWeight: 700, fontSize: '15px', marginBottom: '10px',
                    cursor: addingToCart ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}>
                  {inCart ? '✓ Đã trong giỏ — Xem giỏ hàng' : addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </button>
              )}

              <Link to={`/test/${id}`} style={{
                display: 'block', width: '100%', padding: '13px', background: '#fff', color: '#0056D2',
                border: '2px solid #0056D2', borderRadius: '4px', fontWeight: 700, fontSize: '14px',
                textAlign: 'center', boxSizing: 'border-box', marginBottom: '16px',
              }}>Làm bài test đầu vào</Link>

              {/* Course stats */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#6B7280' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>📝 Số bài học</span><span style={{ fontWeight: 600, color: '#111827' }}>{course.lessonCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>⏱️ Tổng thời lượng</span><span style={{ fontWeight: 600, color: '#111827' }}>{course.totalDuration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>📚 Cấp độ</span><span style={{ fontWeight: 600, color: '#111827' }}>{levelLabel[course.level] || course.level}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>👥 Học viên</span><span style={{ fontWeight: 600, color: '#111827' }}>{course.studentCount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;