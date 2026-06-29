import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const levelLabel = {
  BEGINNER: 'Sơ cấp',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
  'Sơ cấp': 'Sơ cấp',
  'Trung cấp': 'Trung cấp',
  'Nâng cao': 'Nâng cao',
  'Mọi cấp độ': 'Mọi cấp độ',
};

const categories = [
  { name: 'IELTS', count: 24, topic: 'IELTS' },
  { name: 'TOEIC', count: 18, topic: 'TOEIC' },
  { name: 'Giao tiếp', count: 32, topic: 'COMMUNICATION' },
  { name: 'Ngữ pháp', count: 15, topic: 'GRAMMAR' },
  { name: 'Phát âm', count: 10, topic: 'PRONUNCIATION' },
  { name: 'Viết học thuật', count: 12, topic: 'WRITING' },
];

const formatPrice = (price) => {
  if (price === 0 || price === null || price === undefined) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`;
};

const CourseCardSkeleton = () => (
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
      {[35, 86, 58, 48].map((width, index) => (
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
  const id = course.id;
  const title = course.title ?? course.name ?? 'Khóa học tiếng Anh';
  const instructor = course.instructorName ?? course.teacherName ?? course.instructor ?? 'EngMastery';
  const price = course.price ?? course.tuitionFee ?? null;
  const discountPrice = course.discountPrice ?? null;
  const rating = Number(course.rating ?? course.averageRating ?? 0);
  const reviewCount = course.totalReviews ?? course.reviewCount ?? course.reviews ?? 0;
  const level = levelLabel[course.level ?? course.difficulty] ?? course.level ?? course.difficulty ?? '';
  const thumbnail = course.thumbnailUrl ?? course.thumbnail ?? course.imageUrl ?? course.coverImage ?? null;

  return (
    <Link className="course-card" to={`/course/${id}`}>
      <div className="course-card__media">
        {thumbnail ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <span className="course-card__fallback">E</span>
        )}
      </div>
      <div className="course-card__body">
        {level && <div className="course-card__level">{level}</div>}
        <h3 className="course-card__title">{title}</h3>
        <p className="course-card__instructor">{instructor}</p>
        {rating > 0 && (
          <div className="course-card__meta">
            <span className="rating">{rating.toFixed(1)}</span>
            <span className="stars">{'★'.repeat(Math.min(Math.round(rating), 5))}</span>
            {reviewCount > 0 && <span>({Number(reviewCount).toLocaleString('vi-VN')})</span>}
          </div>
        )}
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
        const list = Array.isArray(data) ? data : data.content ?? data.data ?? data.courses ?? [];
        const top4 = list.slice(0, 4);

        const detailedCourses = await Promise.all(
          top4.map(async (course) => {
            try {
              const detailRes = await apiFetch(`/api/courses/${course.id}`);
              if (detailRes.ok) {
                const detail = await detailRes.json();
                return { ...course, ...detail };
              }
            } catch (e) {
              console.warn(`Không lấy được chi tiết khóa học ${course.id}:`, e);
            }
            return course;
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
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div>
            <p className="hero-kicker">Học tiếng Anh cùng giảng viên thực chiến</p>
            <h1 className="hero-title">Kỹ năng tiếng Anh cho mục tiêu học tập và công việc</h1>
            <p className="hero-copy">
              Khám phá các khóa IELTS, TOEIC, giao tiếp và viết học thuật với lộ trình rõ ràng,
              bài học video và đánh giá từ cộng đồng học viên.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/courses">Khám phá khóa học</Link>
              <Link className="btn btn-secondary" to="/dashboard">Học khóa của tôi</Link>
            </div>
          </div>

          <div className="hero-panel" aria-label="EngMastery learning snapshot">
            <div className="hero-panel__tile">
              <div className="hero-panel__brand">EngMastery</div>
              <p style={{ marginTop: 8, color: '#3b3b3b', fontSize: 17 }}>
                Lộ trình học tinh gọn, nội dung dễ quét, bắt đầu nhanh như một marketplace học tập hiện đại.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                ['50+', 'khóa học'],
                ['10K+', 'học viên'],
                ['4.8', 'đánh giá'],
              ].map(([value, label]) => (
                <div className="hero-panel__tile" key={label}>
                  <strong style={{ display: 'block', fontSize: 24 }}>{value}</strong>
                  <span style={{ color: '#636363', fontSize: 13 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-band">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Khám phá theo chủ đề</h2>
              <p className="section-subtitle">Các kỹ năng phổ biến để bạn bắt đầu đúng mục tiêu.</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link className="category-card" key={cat.name} to={`/courses?topic=${cat.topic}`}>
                <strong>{cat.name}</strong>
                <span>{cat.count} khóa học</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-band home-band--muted">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Khóa học nổi bật</h2>
              <p className="section-subtitle">Các khóa học được chọn để học viên mới bắt đầu nhanh hơn.</p>
            </div>
            <Link className="text-link" to="/courses">Xem tất cả khóa học</Link>
          </div>

          {error && (
            <div className="message-box" style={{ marginBottom: 18, color: '#b32d0f', background: '#fff7f4' }}>
              {error}
            </div>
          )}

          <div className="course-grid">
            {loading && [1, 2, 3, 4].map((i) => <CourseCardSkeleton key={i} />)}
            {!loading && featuredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>

          {!loading && !error && featuredCourses.length === 0 && (
            <div className="message-box">Chưa có khóa học nào. Hãy quay lại sau.</div>
          )}
        </div>
      </section>

      <section className="home-band">
        <div className="container">
          <div className="cta-strip">
            <div>
              <h2 className="section-title">Bắt đầu học theo lộ trình của bạn</h2>
              <p className="section-subtitle">
                Lưu khóa học yêu thích, theo dõi tiến độ và quay lại bài học bất cứ lúc nào.
              </p>
            </div>
            <Link className="btn btn-dark" to="/courses">Tìm khóa học phù hợp</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
