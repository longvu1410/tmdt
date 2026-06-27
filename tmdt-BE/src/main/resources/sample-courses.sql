-- Sample English course data for PostgreSQL.
-- Run this after the application has created/updated the schema.

-- 1. Ensure Roles Exist
INSERT INTO roles (name) VALUES
    ('ROLE_STUDENT'),
    ('ROLE_ADMIN'),
    ('ROLE_TEACHER')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Teachers
INSERT INTO users (username, email, password, enabled, display_name, avatar_url, created_at, updated_at)
VALUES
    ('ha_truong_teacher', 'ha_truong_teacher@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Hà Cao Tấn Trường', 'https://api.dicebear.com/7.x/adventurer/svg?seed=ha_truong', NOW(), NOW()),
    ('mai_anh', 'mai_anh@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Cô Mai Anh', 'https://api.dicebear.com/7.x/adventurer/svg?seed=mai_anh', NOW(), NOW()),
    ('minh_quan', 'minh_quan@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Thầy Minh Quân', 'https://api.dicebear.com/7.x/adventurer/svg?seed=minh_quan', NOW(), NOW()),
    ('linh_pham', 'linh_pham@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Cô Linh Phạm', 'https://api.dicebear.com/7.x/adventurer/svg?seed=linh_pham', NOW(), NOW()),
    ('hoang_nam', 'hoang_nam@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Thầy Hoàng Nam', 'https://api.dicebear.com/7.x/adventurer/svg?seed=hoang_nam', NOW(), NOW())
ON CONFLICT (username) DO UPDATE
SET display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    enabled = TRUE,
    updated_at = NOW();

-- Assign ROLE_TEACHER to Teachers
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'ROLE_TEACHER'
  AND u.username IN ('ha_truong_teacher', 'mai_anh', 'minh_quan', 'linh_pham', 'hoang_nam')
ON CONFLICT DO NOTHING;

-- 3. Create Students (for testing)
INSERT INTO users (username, email, password, enabled, display_name, avatar_url, created_at, updated_at)
VALUES
    ('ha_truong', 'ha_truong_student@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'hà trường', 'https://api.dicebear.com/7.x/adventurer/svg?seed=ha_truong_stud', NOW(), NOW()),
    ('student_demo_01', 'student_demo_01@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Nguyễn Văn A', NULL, NOW(), NOW()),
    ('student_demo_02', 'student_demo_02@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Trần Thị B', NULL, NOW(), NOW())
ON CONFLICT (username) DO UPDATE
SET display_name = EXCLUDED.display_name,
    enabled = TRUE,
    updated_at = NOW();

-- Assign ROLE_STUDENT to Students
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'ROLE_STUDENT'
  AND u.username IN ('ha_truong', 'student_demo_01', 'student_demo_02')
ON CONFLICT DO NOTHING;

-- 4. Create Courses corresponding to each Teacher
INSERT INTO courses (
    slug,
    title,
    description,
    price,
    thumbnail_url,
    instructor_name,
    language,
    level,
    topic,
    status,
    rejection_reason,
    teacher_id,
    student_count,
    lesson_count,
    total_duration,
    rating,
    rating_count,
    active,
    created_at,
    updated_at
) VALUES
(
    'toeic-reading-revenue-seed',
    'TOEIC Reading Revenue Seed',
    'Khóa học luyện đọc TOEIC nâng cao và các chiến lược đạt điểm tối đa Part 5, 6, 7.',
    900000.00,
    'https://images.unsplash.com/photo-1513258496099-48168024aec0',
    'Hà Cao Tấn Trường',
    'Tiếng Việt',
    'INTERMEDIATE',
    'TOEIC',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'ha_truong_teacher'),
    1,
    30,
    '20h 30m',
    4.90,
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-7-cap-toc-khoa-1',
    'IELTS 7.0 Cấp Tốc (Khóa 1)',
    'Lộ trình ôn thi IELTS cấp tốc giúp tăng band điểm thần tốc trong thời gian ngắn nhất.',
    1500000.00,
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    'Hà Cao Tấn Trường',
    'Tiếng Việt',
    'INTERMEDIATE',
    'IELTS',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'ha_truong_teacher'),
    0,
    48,
    '36h 35m',
    4.80,
    0,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-foundation-5-5',
    'IELTS Foundation 5.5',
    'Khóa học nền tảng cho người mới bắt đầu IELTS, tập trung ngữ pháp, từ vựng và 4 kỹ năng cơ bản.',
    990000.00,
    'https://images.unsplash.com/photo-1513258496099-48168024aec0',
    'Cô Mai Anh',
    'Tiếng Việt',
    'BEGINNER',
    'IELTS',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'mai_anh'),
    0,
    36,
    '24h 30m',
    4.70,
    0,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-6-5-intensive',
    'IELTS 6.5 Intensive',
    'Lộ trình tăng tốc giúp học viên đạt mục tiêu IELTS 6.5 với chiến lược làm bài và bài tập thực chiến.',
    1290000.00,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    'Thầy Minh Quân',
    'Tiếng Việt',
    'INTERMEDIATE',
    'IELTS',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'minh_quan'),
    0,
    44,
    '31h 20m',
    4.80,
    0,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-writing-masterclass',
    'IELTS Writing Masterclass',
    'Chuyên sâu Writing Task 1 và Task 2, hướng dẫn lập dàn ý, phát triển ý và sửa lỗi thường gặp.',
    850000.00,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    'Cô Linh Phạm',
    'Tiếng Việt',
    'INTERMEDIATE',
    'WRITING',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'linh_pham'),
    0,
    28,
    '18h 45m',
    4.85,
    0,
    TRUE,
    NOW(),
    NOW()
),
(
    'toeic-650-cap-toc',
    'TOEIC 650 Cấp Tốc',
    'Khóa học TOEIC tập trung Listening và Reading, phù hợp người cần điểm đầu ra trong thời gian ngắn.',
    790000.00,
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    'Thầy Hoàng Nam',
    'Tiếng Việt',
    'BEGINNER',
    'TOEIC',
    'APPROVED',
    NULL,
    (SELECT id FROM users WHERE username = 'hoang_nam'),
    0,
    40,
    '26h 10m',
    4.75,
    0,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE
SET teacher_id = EXCLUDED.teacher_id,
    instructor_name = EXCLUDED.instructor_name,
    price = EXCLUDED.price,
    status = 'APPROVED',
    active = TRUE,
    updated_at = NOW();

-- 5. Safe clean up of existing element collections for seed courses to avoid key conflicts
DELETE FROM course_outcomes WHERE course_id IN (SELECT id FROM courses WHERE slug IN ('toeic-reading-revenue-seed', 'ielts-7-cap-toc-khoa-1', 'ielts-foundation-5-5', 'ielts-6-5-intensive', 'ielts-writing-masterclass', 'toeic-650-cap-toc'));
DELETE FROM course_benefits WHERE course_id IN (SELECT id FROM courses WHERE slug IN ('toeic-reading-revenue-seed', 'ielts-7-cap-toc-khoa-1', 'ielts-foundation-5-5', 'ielts-6-5-intensive', 'ielts-writing-masterclass', 'toeic-650-cap-toc'));
DELETE FROM course_sections WHERE course_id IN (SELECT id FROM courses WHERE slug IN ('toeic-reading-revenue-seed', 'ielts-7-cap-toc-khoa-1', 'ielts-foundation-5-5', 'ielts-6-5-intensive', 'ielts-writing-masterclass', 'toeic-650-cap-toc'));
DELETE FROM course_reviews WHERE course_id IN (SELECT id FROM courses WHERE slug IN ('toeic-reading-revenue-seed', 'ielts-7-cap-toc-khoa-1', 'ielts-foundation-5-5', 'ielts-6-5-intensive', 'ielts-writing-masterclass', 'toeic-650-cap-toc'));

-- 6. Insert Outcomes
WITH outcomes_data(slug, sort_order, outcome) AS (
    VALUES
    ('toeic-reading-revenue-seed', 0, 'Hiểu sâu phương pháp đọc hiểu TOEIC'),
    ('toeic-reading-revenue-seed', 1, 'Mẹo tránh bẫy ngữ pháp thường gặp'),
    ('toeic-reading-revenue-seed', 2, 'Chiến thuật làm bài Part 7 cực nhanh'),
    ('ielts-7-cap-toc-khoa-1', 0, 'Nắm vững cấu trúc đề thi IELTS chuẩn'),
    ('ielts-7-cap-toc-khoa-1', 1, 'Chiến lược Listening band 7+'),
    ('ielts-7-cap-toc-khoa-1', 2, 'Kỹ năng trả lời Speaking lưu loát'),
    ('ielts-foundation-5-5', 0, 'Xây dựng nền tảng từ vựng và ngữ pháp'),
    ('ielts-foundation-5-5', 1, 'Luyện 4 kỹ năng ở mức cơ bản'),
    ('ielts-6-5-intensive', 0, 'Viết bài Task 1 và Task 2 đúng cấu trúc'),
    ('ielts-6-5-intensive', 1, 'Luyện đề thực tế IELTS cọ xát hiện tại'),
    ('ielts-writing-masterclass', 0, 'Lập dàn ý nhanh cho Task 2'),
    ('ielts-writing-masterclass', 1, 'Giảm lỗi ngữ pháp và từ vựng học thuật'),
    ('toeic-650-cap-toc', 0, 'Cải thiện phản xạ nghe hiểu đề TOEIC'),
    ('toeic-650-cap-toc', 1, 'Nắm trọn vẹn ngữ pháp cơ bản để làm bài')
)
INSERT INTO course_outcomes (course_id, sort_order, outcome)
SELECT c.id, od.sort_order, od.outcome
FROM outcomes_data od
JOIN courses c ON c.slug = od.slug;

-- 7. Insert Benefits
WITH benefits_data(slug, sort_order, benefit) AS (
    VALUES
    ('toeic-reading-revenue-seed', 0, 'Truy cập trọn đời các bài học'),
    ('toeic-reading-revenue-seed', 1, 'Tài liệu độc quyền của thầy Trường'),
    ('toeic-reading-revenue-seed', 2, 'Hỗ trợ giải đáp 24/7 trực tuyến'),
    ('ielts-7-cap-toc-khoa-1', 0, 'Chứng chỉ hoàn thành khóa học'),
    ('ielts-7-cap-toc-khoa-1', 1, 'Hỗ trợ sửa bài viết chi tiết'),
    ('ielts-foundation-5-5', 0, 'Bài tập sau mỗi buổi học'),
    ('ielts-foundation-5-5', 1, 'Group trao đổi học viên thân thiện'),
    ('ielts-6-5-intensive', 0, 'Kho tài liệu ôn tập đồ sộ'),
    ('ielts-writing-masterclass', 0, 'Bộ bài viết mẫu band 7.5+'),
    ('toeic-650-cap-toc', 0, 'Đề thi thử sát thực tế có giải thích chi tiết')
)
INSERT INTO course_benefits (course_id, sort_order, benefit)
SELECT c.id, bd.sort_order, bd.benefit
FROM benefits_data bd
JOIN courses c ON c.slug = bd.slug;

-- 8. Insert Course Sections with Video URLs (Using reliable sample public video files)
WITH sections_data(slug, sort_order, title, description, skills, lesson_count, duration, video_url) AS (
    VALUES
    ('toeic-reading-revenue-seed', 0, 'Chương 1: Giới thiệu & Cấu trúc đề thi', 'Nắm tổng quan cấu trúc phần thi Reading và Listening của TOEIC. Các điểm cần lưu ý khi bắt đầu ôn tập.', '["TOEIC Overview","Study Planning"]', 5, '45:00', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('toeic-reading-revenue-seed', 1, 'Chương 2: Grammar nền tảng', 'Hệ thống hóa toàn bộ các chủ điểm ngữ pháp trọng tâm thường xuyên xuất hiện trong Part 5 & 6.', '["English Grammar","Core Grammar"]', 5, '55:20', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    ('toeic-reading-revenue-seed', 2, 'Chương 3: Từ vựng chủ đề Environment', 'Mở rộng vốn từ vựng thuộc nhóm chủ đề Môi trường và các cụm từ collocations đi kèm cực kỳ phổ biến.', '["Environment Vocabulary","Collocations"]', 5, '30:15', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
    ('toeic-reading-revenue-seed', 3, 'Chương 4: Listening Practice', 'Thực hành các kỹ năng nghe từ khóa, bắt thông tin nhanh và loại trừ các đáp án nhiễu phổ biến.', '["Listening Skills","Distractors Extraction"]', 5, '40:10', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
    ('toeic-reading-revenue-seed', 4, 'Chương 5: Reading Strategies', 'Chiến lược tối ưu hóa thời gian đọc hiểu Part 7, cách skimming & scanning hiệu quả để tìm đáp án chính xác nhất.', '["Reading Comprehension","Time Management"]', 10, '35:00', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),

    ('ielts-7-cap-toc-khoa-1', 0, 'Giới thiệu & Cấu trúc đề thi IELTS', 'Tổng quan chi tiết cấu trúc đề thi Academic & General. Tiêu chuẩn đánh giá từ ban giám khảo.', '["IELTS Overview","Assessment Criteria"]', 5, '3h 20m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('ielts-7-cap-toc-khoa-1', 1, 'Listening Skills', 'Luyện nghe bám đuổi keywords, take note nhanh các thông tin quan trọng.', '["Listening","Keyword Tracking"]', 8, '5h 45m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    ('ielts-7-cap-toc-khoa-1', 2, 'Reading Strategies', 'Thực hành các phương pháp đọc nhanh và kỹ thuật định vị thông tin trong bài đọc dài.', '["Reading","Skimming","Scanning"]', 10, '7h 10m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),

    ('ielts-foundation-5-5', 0, 'Làm quen đề thi IELTS', 'Giới thiệu format bài thi cơ bản dành cho các bạn mới bắt đầu học.', '["Introduction","Basics"]', 6, '3h 20m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('ielts-foundation-5-5', 1, 'Nền tảng Ngữ pháp', 'Các thì cơ bản và cấu trúc câu thông dụng cần nắm vững.', '["Grammar","Tenses"]', 10, '7h 00m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),

    ('ielts-6-5-intensive', 0, 'Chiến thuật IELTS chuyên sâu', 'Phân tích chiến thuật nâng band điểm từ 5.0 lên 6.5.', '["IELTS Strategy","Score Raising"]', 6, '4h 00m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('ielts-6-5-intensive', 1, 'Luyện viết Task 1 & 2', 'Cấu trúc bài viết và các từ vựng chuyển ý đắt giá.', '["Writing Task 1","Writing Task 2"]', 14, '10h 20m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),

    ('ielts-writing-masterclass', 0, 'Chương 1: Phân tích đề thi Writing', 'Hướng dẫn cách phân tích yêu cầu đề bài của Writing Task 1 và Task 2.', '["Task Analysis","Topic Brainstorming"]', 6, '2h 30m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('ielts-writing-masterclass', 1, 'Chương 2: Cấu trúc câu & Từ vựng cho Task 1', 'Các cấu trúc miêu tả biểu đồ, số liệu tăng giảm và so sánh.', '["Data Description","Academic Vocabulary"]', 8, '3h 15m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    ('ielts-writing-masterclass', 2, 'Chương 3: Chiến thuật lập luận Task 2', 'Phương pháp triển khai ý tưởng, lấy ví dụ và viết các đoạn thân bài mạch lạc.', '["Essay Structure","Coherence & Cohesion"]', 8, '4h 10m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),

    ('toeic-650-cap-toc', 0, 'Chương 1: Tổng quan cấu trúc và cách ôn thi', 'Tìm hiểu cấu trúc đề thi TOEIC mới nhất và chiến thuật phân bổ thời gian.', '["TOEIC Overview","Time Distribution"]', 5, '2h 10m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    ('toeic-650-cap-toc', 1, 'Chương 2: Luyện nghe tranh Part 1 & 2', 'Các mẹo tránh bẫy đồng âm, bẫy đại từ và kỹ năng chọn đáp án đúng nhanh.', '["Listening Part 1","Listening Part 2"]', 10, '5h 15m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    ('toeic-650-cap-toc', 2, 'Chương 3: Ngữ pháp TOEIC ăn điểm nhanh', 'Hệ thống các chủ điểm ngữ pháp cốt lõi hay gặp trong phần thi đọc.', '["TOEIC Grammar","Part 5 Practice"]', 12, '6h 30m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
)
INSERT INTO course_sections (course_id, sort_order, title, description, skills, lesson_count, duration, video_url)
SELECT c.id, sd.sort_order, sd.title, sd.description, sd.skills, sd.lesson_count, sd.duration, sd.video_url
FROM sections_data sd
JOIN courses c ON c.slug = sd.slug;

-- 9. Create paid orders & enrollments for students to access the courses
WITH order_seeding(payment_ref, course_slug, username, price) AS (
    VALUES
    ('ORDER-MOCK-SEED-01', 'toeic-reading-revenue-seed', 'ha_truong', 900000.00),
    ('ORDER-MOCK-SEED-02', 'ielts-7-cap-toc-khoa-1', 'ha_truong', 1500000.00),
    ('ORDER-MOCK-SEED-03', 'ielts-foundation-5-5', 'student_demo_01', 990000.00),
    ('ORDER-MOCK-SEED-04', 'ielts-6-5-intensive', 'student_demo_02', 1290000.00)
)
INSERT INTO course_orders (
    course_id,
    student_id,
    voucher_code,
    original_amount,
    discount_amount,
    total_amount,
    payment_method,
    payment_reference,
    status,
    created_at,
    paid_at,
    cancelled_at
)
SELECT
    c.id,
    u.id,
    NULL,
    os.price,
    0.00,
    os.price,
    'MOCK',
    os.payment_ref,
    'PAID',
    NOW(),
    NOW(),
    NULL
FROM order_seeding os
JOIN courses c ON c.slug = os.course_slug
JOIN users u ON u.username = os.username
WHERE NOT EXISTS (
    SELECT 1 FROM course_orders WHERE payment_reference = os.payment_ref
);

-- Enroll the students automatically based on the paid orders
INSERT INTO course_enrollments (course_id, student_id, purchased_at)
SELECT o.course_id, o.student_id, o.paid_at
FROM course_orders o
WHERE o.status = 'PAID'
  AND o.payment_reference LIKE 'ORDER-MOCK-SEED-%'
ON CONFLICT (course_id, student_id) DO NOTHING;

-- Update course student counts
UPDATE courses c
SET student_count = counts.enrollment_count,
    updated_at = NOW()
FROM (
    SELECT course_id, COUNT(*)::int AS enrollment_count
    FROM course_enrollments
    GROUP BY course_id
) counts
WHERE c.id = counts.course_id;

-- 10. Insert Course Reviews
WITH reviews_data(slug, sort_order, student_name, rating, comment) AS (
    VALUES
    ('toeic-reading-revenue-seed', 0, 'Học viên Ẩn Danh', 5, 'Khóa học cực kỳ chi tiết, nhiều mẹo hay áp dụng được ngay!'),
    ('ielts-7-cap-toc-khoa-1', 0, 'Nguyễn Văn A', 5, 'Thầy Trường giảng siêu nhiệt tình, lộ trình rất dễ theo.')
)
INSERT INTO course_reviews (course_id, sort_order, student_name, student_id, rating, comment, created_at)
SELECT c.id, rd.sort_order, rd.student_name, NULL, rd.rating, rd.comment, NOW()
FROM reviews_data rd
JOIN courses c ON c.slug = rd.slug;
