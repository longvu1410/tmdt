import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const TOPICS = [
  { code: 'IELTS', label: 'IELTS' },
  { code: 'TOEIC', label: 'TOEIC' },
  { code: 'COMMUNICATION', label: 'Giao tiếp' },
  { code: 'GRAMMAR', label: 'Ngữ pháp' },
  { code: 'PRONUNCIATION', label: 'Phát âm' },
  { code: 'WRITING', label: 'Viết' },
];

const LEVELS = [
  { code: 'BEGINNER', label: 'Sơ cấp' },
  { code: 'INTERMEDIATE', label: 'Trung cấp' },
  { code: 'ADVANCED', label: 'Nâng cao' },
];

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: Infinity },
  { label: 'Miễn phí', min: 0, max: 0 },
  { label: 'Dưới 500.000đ', min: 1, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

const ITEMS_PER_PAGE = 6;

const formatPrice = (price) => {
  if (price === 0 || price == null) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`;
};

const levelLabel = {
  BEGINNER: 'Sơ cấp',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
};

const getEffectivePrice = (course) => (
  course.discountPrice !== null && course.discountPrice !== undefined
    ? course.discountPrice
    : course.price ?? 0
);

const Skeleton = () => (
  <div className="course-card">
    <div
      className="course-card__media"
      style={{
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e2e8f0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
    <div className="course-card__body">
      {[42, 88, 62, 44].map((width, index) => (
        <div
          key={width}
          style={{
            width: `${width}%`,
            height: index === 1 ? 18 : 13,
            marginBottom: 10,
            borderRadius: 2,
            background: '#e5e7eb',
          }}
        />
      ))}
    </div>
  </div>
);

const CourseCard = ({ course }) => {
  const [imgErr, setImgErr] = useState(false);
  const {
    id,
    title,
    instructorName,
    price,
    discountPrice,
    rating,
    ratingCount,
    level,
    thumbnailUrl,
    studentCount,
    totalDuration,
  } = course;
  const stars = Math.min(Math.round(Number(rating || 0)), 5);

  return (
    <Link className="course-card" to={`/course/${id}`}>
      <div className="course-card__media">
        {thumbnailUrl && !imgErr ? (
          <img src={thumbnailUrl} alt={title} onError={() => setImgErr(true)} />
        ) : (
          <span className="course-card__fallback">E</span>
        )}
      </div>
      <div className="course-card__body">
        {level && <div className="course-card__level">{levelLabel[level] || level}</div>}
        <h3 className="course-card__title">{title || 'Khóa học tiếng Anh'}</h3>
        <p className="course-card__instructor">{instructorName || 'EngMastery'}</p>

        {Number(rating) > 0 && (
          <div className="course-card__meta">
            <span className="rating">{Number(rating).toFixed(1)}</span>
            <span className="stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            {ratingCount > 0 && <span>({Number(ratingCount).toLocaleString('vi-VN')})</span>}
          </div>
        )}

        <div className="course-card__meta">
          {studentCount > 0 && <span>{Number(studentCount).toLocaleString('vi-VN')} học viên</span>}
          {totalDuration && <span>{totalDuration}</span>}
        </div>

        <div className="course-card__price">
          {discountPrice !== null && discountPrice !== undefined && discountPrice >= 0 ? (
            <>
              {formatPrice(discountPrice)}
              <span className="price-old">{formatPrice(price)}</span>
            </>
          ) : (
            formatPrice(price)
          )}
        </div>
      </div>
    </Link>
  );
};

const FilterCheck = ({ checked, onChange, children, type = 'checkbox', name }) => (
  <label className="filter-option">
    <input type={type} name={name} checked={checked} onChange={onChange} />
    <span>{children}</span>
  </label>
);

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState(() => {
    const topic = searchParams.get('topic');
    return topic ? [topic] : [];
  });
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState(0);
  const [sort, setSort] = useState('newest');
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('/api/courses');
        if (!res.ok) throw new Error('Không thể tải khóa học');
        const data = await res.json();
        setAllCourses(Array.isArray(data) ? data : data.content ?? data.data ?? data.courses ?? []);
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const toggleTopic = (code) => {
    setCurrentPage(1);
    setSelectedTopics((prev) => (
      prev.includes(code) ? prev.filter((topic) => topic !== code) : [...prev, code]
    ));
  };

  const toggleLevel = (code) => {
    setCurrentPage(1);
    setSelectedLevels((prev) => (
      prev.includes(code) ? prev.filter((level) => level !== code) : [...prev, code]
    ));
  };

  const filtered = (() => {
    let list = [...allCourses];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((course) => (
        course.title?.toLowerCase().includes(q)
        || course.instructorName?.toLowerCase().includes(q)
        || course.description?.toLowerCase().includes(q)
      ));
    }

    if (selectedTopics.length > 0) {
      list = list.filter((course) => selectedTopics.includes(course.topic));
    }

    if (selectedLevels.length > 0) {
      list = list.filter((course) => selectedLevels.includes(course.level));
    }

    const { min, max } = PRICE_RANGES[priceRange];
    if (priceRange !== 0) {
      list = list.filter((course) => {
        const priceValue = getEffectivePrice(course);
        return priceValue >= min && (max === Infinity || priceValue <= max);
      });
    }

    switch (sort) {
      case 'popular':
        list.sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_asc':
        list.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case 'price_desc':
        list.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      default:
        break;
    }

    return list;
  })();

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCourses = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setCurrentPage(1);
    setSelectedTopics([]);
    setSelectedLevels([]);
    setPriceRange(0);
    setSearchText('');
    setSort('newest');
  };

  const hasFilters = selectedTopics.length > 0
    || selectedLevels.length > 0
    || priceRange !== 0
    || Boolean(searchText.trim());

  return (
    <div className="courses-page">
      <section className="courses-header">
        <div className="container">
          <h1>Khóa học tiếng Anh trực tuyến</h1>
          <p className="section-subtitle">
            {loading ? 'Đang tải khóa học...' : `${filtered.length} kết quả phù hợp`}
          </p>

          <div className="courses-tools">
            <div className="course-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={searchText}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchText(e.target.value);
                }}
                placeholder="Bạn muốn học gì?"
              />
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => {
                setCurrentPage(1);
                setSort(e.target.value);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="active-chips">
              {selectedTopics.map((code) => {
                const topic = TOPICS.find((item) => item.code === code);
                return (
                  <span className="chip" key={code}>
                    {topic?.label || code}
                    <button type="button" onClick={() => toggleTopic(code)}>×</button>
                  </span>
                );
              })}
              {selectedLevels.map((code) => {
                const level = LEVELS.find((item) => item.code === code);
                return (
                  <span className="chip" key={code}>
                    {level?.label || code}
                    <button type="button" onClick={() => toggleLevel(code)}>×</button>
                  </span>
                );
              })}
              {priceRange !== 0 && (
                <span className="chip">
                  {PRICE_RANGES[priceRange].label}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setPriceRange(0);
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              {searchText.trim() && (
                <span className="chip">
                  {searchText}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setSearchText('');
                    }}
                  >
                    ×
                  </button>
                </span>
              )}
              <button className="chip" type="button" onClick={clearFilters}>Xóa tất cả</button>
            </div>
          )}
        </div>
      </section>

      <div className="container courses-layout">
        <aside className="filter-rail">
          <div className="filter-title">Bộ lọc</div>

          <div className="filter-group">
            <h3>Chủ đề</h3>
            {TOPICS.map((topic) => (
              <FilterCheck
                key={topic.code}
                checked={selectedTopics.includes(topic.code)}
                onChange={() => toggleTopic(topic.code)}
              >
                {topic.label}
              </FilterCheck>
            ))}
          </div>

          <div className="filter-group">
            <h3>Cấp độ</h3>
            {LEVELS.map((level) => (
              <FilterCheck
                key={level.code}
                checked={selectedLevels.includes(level.code)}
                onChange={() => toggleLevel(level.code)}
              >
                {level.label}
              </FilterCheck>
            ))}
          </div>

          <div className="filter-group">
            <h3>Khoảng giá</h3>
            {PRICE_RANGES.map((range, index) => (
              <FilterCheck
                key={range.label}
                type="radio"
                name="price"
                checked={priceRange === index}
                onChange={() => {
                  setCurrentPage(1);
                  setPriceRange(index);
                }}
              >
                {range.label}
              </FilterCheck>
            ))}
          </div>

          {hasFilters && (
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 18 }} onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </aside>

        <section>
          {error && (
            <div className="message-box" style={{ marginBottom: 18, color: '#b32d0f', background: '#fff7f4' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="courses-results-grid">
              {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} />)}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="message-box">
              <h2 style={{ marginBottom: 8 }}>Không tìm thấy khóa học</h2>
              <p style={{ color: '#636363', marginBottom: 18 }}>
                Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc.
              </p>
              <button className="btn btn-primary" type="button" onClick={clearFilters}>Xóa bộ lọc</button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <p className="results-count">
                Hiển thị <strong>{Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)}</strong> trong <strong>{filtered.length}</strong> khóa học
              </p>
              <div className="courses-results-grid">
                {paginatedCourses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-button${page === currentPage ? ' is-active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="page-button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
