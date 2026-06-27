import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

// ── Constants ─────────────────────────────────────────────────────
const TOPICS = [
  { code: 'IELTS', label: 'IELTS', icon: '🎯' },
  { code: 'TOEIC', label: 'TOEIC', icon: '📊' },
  { code: 'COMMUNICATION', label: 'Giao tiếp', icon: '💬' },
  { code: 'GRAMMAR', label: 'Ngữ pháp', icon: '📖' },
  { code: 'PRONUNCIATION', label: 'Phát âm', icon: '🎙️' },
  { code: 'WRITING', label: 'Viết', icon: '✍️' },
];

const LEVELS = [
  { code: 'BEGINNER', label: 'Sơ cấp', color: '#059669' },
  { code: 'INTERMEDIATE', label: 'Trung cấp', color: '#D97706' },
  { code: 'ADVANCED', label: 'Nâng cao', color: '#DC2626' },
];

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: Infinity },
  { label: 'Miễn phí', min: 0, max: 0 },
  { label: 'Dưới 500.000đ', min: 1, max: 500000 },
  { label: '500.000đ – 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ – 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

// ── Helpers ───────────────────────────────────────────────────────
const formatPrice = (price) => {
  if (price === 0 || price == null) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const levelLabel = { BEGINNER: 'Sơ cấp', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao' };
const levelColor = { BEGINNER: '#059669', INTERMEDIATE: '#D97706', ADVANCED: '#DC2626' };

// ── Skeleton ──────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
    <div style={{ height: '170px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '16px 18px 18px' }}>
      {[80, 60, 45, 30].map((w, i) => (
        <div key={i} style={{ height: i === 1 ? 18 : 13, width: `${w}%`, background: '#E5E7EB', borderRadius: '4px', marginBottom: '10px' }} />
      ))}
    </div>
  </div>
);

// ── Course Card ───────────────────────────────────────────────────
const CourseCard = ({ course }) => {
  const { id, title, instructorName, price, discountPrice, rating, ratingCount, level, thumbnailUrl, studentCount, totalDuration } = course;
  const [imgErr, setImgErr] = useState(false);


  return (
    <Link to={`/course/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB',
        overflow: 'hidden', height: '100%',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', height: '170px', background: 'linear-gradient(135deg, #E8F1FF, #D1E3FF)', overflow: 'hidden' }}>
          {thumbnailUrl && !imgErr ? (
            <img src={thumbnailUrl} alt={title} onError={() => setImgErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>
              {TOPICS.find(t => t.code === course.topic)?.icon || '📚'}
            </div>
          )}
          {/* Level badge */}
          {level && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              background: levelColor[level] || '#6B7280', color: '#fff',
              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
            }}>
              {levelLabel[level] || level}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px 18px 18px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.35, marginBottom: '6px', color: '#111827',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '10px' }}>{instructorName}</p>

          {/* Rating */}
          {rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '13px' }}>{Number(rating).toFixed(1)}</span>
              <span style={{ color: '#F59E0B', fontSize: '12px' }}>
                {'★'.repeat(Math.min(Math.round(rating), 5))}{'☆'.repeat(Math.max(0, 5 - Math.round(rating)))}
              </span>
              {ratingCount > 0 && <span style={{ color: '#9CA3AF', fontSize: '11px' }}>({ratingCount})</span>}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: '12px', color: '#9CA3AF', fontSize: '12px', marginBottom: '12px' }}>
            {studentCount > 0 && <span>👥 {studentCount.toLocaleString('vi-VN')}</span>}
            {totalDuration && <span>⏱ {totalDuration}</span>}
          </div>

          {/* Price */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
            {discountPrice !== null && discountPrice !== undefined && discountPrice >= 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '17px', color: '#DC2626' }}>{formatPrice(discountPrice)}</span>
                <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '13px' }}>{formatPrice(price)}</span>
              </div>
            ) : (
              <span style={{
                fontWeight: 800, fontSize: '17px',
                color: price === 0 || price == null ? '#059669' : '#111827',
              }}>
                {formatPrice(price)}
              </span>
            )}
          </div>

        </div>
      </div>
    </Link>
  );
};

// ── Filter Checkbox ───────────────────────────────────────────────
const FilterCheck = ({ checked, onChange, children }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 0', fontSize: '14px', color: checked ? '#0056D2' : '#374151' }}>
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ width: '16px', height: '16px', accentColor: '#0056D2', cursor: 'pointer' }} />
    {children}
  </label>
);

// ── Main Page ─────────────────────────────────────────────────────
const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [selectedTopics, setSelectedTopics] = useState(() => {
    const t = searchParams.get('topic');
    return t ? [t] : [];
  });
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES
  const [sort, setSort] = useState('newest');
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');

  // Fetch all courses
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('/api/courses');
        if (!res.ok) throw new Error('Không thể tải khóa học');
        const data = await res.json();
        setAllCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Toggle topic
  const toggleTopic = (code) => {
    setSelectedTopics(prev => prev.includes(code) ? prev.filter(t => t !== code) : [...prev, code]);
  };

  // Toggle level
  const toggleLevel = (code) => {
    setSelectedLevels(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
  };

  // Apply filters + sort
  const filtered = (() => {
    let list = [...allCourses];

    // Search text
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.instructorName?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    // Topics
    if (selectedTopics.length > 0) {
      list = list.filter(c => selectedTopics.includes(c.topic));
    }

    // Levels
    if (selectedLevels.length > 0) {
      list = list.filter(c => selectedLevels.includes(c.level));
    }

    // Price range
    const { min, max } = PRICE_RANGES[priceRange];
    if (priceRange !== 0) {
      list = list.filter(c => {
        const p = c.discountPrice !== null && c.discountPrice !== undefined ? c.discountPrice : (c.price ?? 0);
        return p >= min && (max === Infinity ? true : p <= max);
      });
    }

    // Sort
    switch (sort) {
      case 'popular': list.sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0)); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price_asc': list.sort((a, b) => {
        const pa = a.discountPrice !== null && a.discountPrice !== undefined ? a.discountPrice : (a.price || 0);
        const pb = b.discountPrice !== null && b.discountPrice !== undefined ? b.discountPrice : (b.price || 0);
        return pa - pb;
      }); break;
      case 'price_desc': list.sort((a, b) => {
        const pa = a.discountPrice !== null && a.discountPrice !== undefined ? a.discountPrice : (a.price || 0);
        const pb = b.discountPrice !== null && b.discountPrice !== undefined ? b.discountPrice : (b.price || 0);
        return pb - pa;
      }); break;
      default: break; // newest = default API order
    }


    return list;
  })();

  const clearFilters = () => {
    setSelectedTopics([]);
    setSelectedLevels([]);
    setPriceRange(0);
    setSearchText('');
    setSort('newest');
  };

  const hasFilters = selectedTopics.length > 0 || selectedLevels.length > 0 || priceRange !== 0 || searchText.trim();

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>Tất cả khóa học</h1>
        <p style={{ color: '#6B7280', fontSize: '15px' }}>
          {loading ? 'Đang tải...' : `${filtered.length} khóa học`}
          {hasFilters && ' (đang lọc)'}
        </p>
      </div>

      {/* Search bar + Sort */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '16px' }}>🔍</span>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Tìm kiếm khóa học, giảng viên..."
            style={{
              width: '100%', height: '44px', border: '1px solid #D1D5DB', borderRadius: '8px',
              padding: '0 14px 0 42px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#0056D2'}
            onBlur={e => e.target.style.borderColor = '#D1D5DB'}
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          height: '44px', border: '1px solid #D1D5DB', borderRadius: '8px',
          padding: '0 36px 0 14px', fontSize: '14px', outline: 'none',
          background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236B7280\' fill=\'none\' stroke-width=\'1.5\'/%3E%3C/svg%3E") no-repeat right 12px center',
          appearance: 'none', cursor: 'pointer',
        }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {selectedTopics.map(t => {
            const topic = TOPICS.find(x => x.code === t);
            return (
              <span key={t} style={{ background: '#E8F1FF', color: '#0056D2', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {topic?.icon} {topic?.label}
                <button onClick={() => toggleTopic(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0056D2', fontWeight: 700, fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            );
          })}
          {selectedLevels.map(l => {
            const lv = LEVELS.find(x => x.code === l);
            return (
              <span key={l} style={{ background: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {lv?.label}
                <button onClick={() => toggleLevel(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', fontWeight: 700, fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            );
          })}
          {priceRange !== 0 && (
            <span style={{ background: '#FFFBEB', color: '#D97706', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              💰 {PRICE_RANGES[priceRange].label}
              <button onClick={() => setPriceRange(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D97706', fontWeight: 700, fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
            </span>
          )}
          <button onClick={clearFilters} style={{ background: 'none', border: '1px solid #D1D5DB', color: '#6B7280', padding: '4px 14px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Main layout: sidebar + grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'start' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '20px', position: 'sticky', top: '80px' }}>

          {/* Topic */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#111827' }}>📌 Chủ đề</h3>
            {TOPICS.map(t => (
              <FilterCheck key={t.code} checked={selectedTopics.includes(t.code)} onChange={() => toggleTopic(t.code)}>
                <span>{t.icon} {t.label}</span>
              </FilterCheck>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '20px' }} />

          {/* Level */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#111827' }}>📊 Cấp độ</h3>
            {LEVELS.map(l => (
              <FilterCheck key={l.code} checked={selectedLevels.includes(l.code)} onChange={() => toggleLevel(l.code)}>
                <span style={{ color: selectedLevels.includes(l.code) ? l.color : 'inherit' }}>{l.label}</span>
              </FilterCheck>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '20px' }} />

          {/* Price range */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#111827' }}>💰 Khoảng giá</h3>
            {PRICE_RANGES.map((range, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 0', fontSize: '14px', color: priceRange === idx ? '#0056D2' : '#374151' }}>
                <input type="radio" name="price" checked={priceRange === idx} onChange={() => setPriceRange(idx)}
                  style={{ accentColor: '#0056D2', cursor: 'pointer' }} />
                {range.label}
              </label>
            ))}
          </div>

          {/* Clear */}
          {hasFilters && (
            <>
              <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '20px', paddingTop: '16px' }} />
              <button onClick={clearFilters} style={{
                width: '100%', padding: '10px', border: '1px solid #D1D5DB',
                background: '#fff', color: '#374151', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              }}>
                🗑 Xóa tất cả bộ lọc
              </button>
            </>
          )}
        </aside>

        {/* ── COURSE GRID ── */}
        <div>
          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 16px', borderRadius: '8px', color: '#DC2626', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#F9FAFB', borderRadius: '12px', border: '2px dashed #E5E7EB' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔎</div>
              <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>Không tìm thấy khóa học</h2>
              <p style={{ color: '#6B7280', marginBottom: '20px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={clearFilters} style={{
                background: '#0056D2', color: '#fff', border: 'none',
                padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
              }}>Xóa bộ lọc</button>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
                Hiển thị <strong>{filtered.length}</strong> / {allCourses.length} khóa học
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {filtered.map(course => <CourseCard key={course.id} course={course} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
