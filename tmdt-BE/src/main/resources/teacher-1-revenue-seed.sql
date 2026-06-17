-- Seed paid orders/revenue for teacher id = 1.
-- Run after the application has created tables.
-- Example:
-- psql -U postgres -d tmdt -f src/main/resources/teacher-1-revenue-seed.sql

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = 1) THEN
        RAISE EXCEPTION 'Teacher user id=1 does not exist';
    END IF;
END $$;

INSERT INTO roles (name)
VALUES
    ('ROLE_STUDENT'),
    ('ROLE_TEACHER')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 1, r.id
FROM roles r
WHERE r.name = 'ROLE_TEACHER'
ON CONFLICT DO NOTHING;

INSERT INTO users (username, email, password, enabled, display_name, avatar_url, created_at, updated_at)
VALUES
    ('seed_student_01', 'seed_student_01@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Tran Minh Anh', NULL, NOW(), NOW()),
    ('seed_student_02', 'seed_student_02@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Le Bao Ngoc', NULL, NOW(), NOW()),
    ('seed_student_03', 'seed_student_03@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Pham Hoai Nam', NULL, NOW(), NOW()),
    ('seed_student_04', 'seed_student_04@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Do Mai Linh', NULL, NOW(), NOW()),
    ('seed_student_05', 'seed_student_05@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Hoang Anh Thu', NULL, NOW(), NOW())
ON CONFLICT (username) DO UPDATE
SET display_name = EXCLUDED.display_name,
    enabled = TRUE,
    updated_at = NOW();

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_STUDENT'
WHERE u.username IN ('seed_student_01', 'seed_student_02', 'seed_student_03', 'seed_student_04', 'seed_student_05')
ON CONFLICT DO NOTHING;

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
)
VALUES
(
    'teacher-1-ielts-speaking-revenue',
    'IELTS Speaking Revenue Seed',
    'Khoa hoc seed doanh thu cho teacher id 1, tap trung Speaking va phan xa tra loi.',
    1200000.00,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE id = 1),
    'Trung cap',
    'INTERMEDIATE',
    'IELTS',
    'APPROVED',
    NULL,
    1,
    0,
    24,
    '18h 00m',
    4.80,
    12,
    TRUE,
    NOW(),
    NOW()
),
(
    'teacher-1-toeic-reading-revenue',
    'TOEIC Reading Revenue Seed',
    'Khoa hoc seed doanh thu cho teacher id 1, luyen Reading TOEIC va chien luoc lam bai.',
    900000.00,
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE id = 1),
    'Co ban',
    'BEGINNER',
    'TOEIC',
    'APPROVED',
    NULL,
    1,
    0,
    30,
    '20h 30m',
    4.70,
    9,
    TRUE,
    NOW(),
    NOW()
),
(
    'teacher-1-business-english-revenue',
    'Business English Revenue Seed',
    'Khoa hoc seed doanh thu cho teacher id 1, phu hop hoc vien can tieng Anh cong viec.',
    1500000.00,
    'https://images.unsplash.com/photo-1556761175-b413da4baf72',
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE id = 1),
    'Trung cap',
    'INTERMEDIATE',
    'COMMUNICATION',
    'APPROVED',
    NULL,
    1,
    0,
    28,
    '22h 00m',
    4.90,
    16,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE
SET teacher_id = 1,
    instructor_name = (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE id = 1),
    status = 'APPROVED',
    active = TRUE,
    updated_at = NOW();

WITH paid_orders(order_key, course_slug, student_username, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, paid_at) AS (
    VALUES
    ('T1-Q1-001', 'teacher-1-ielts-speaking-revenue', 'seed_student_01', NULL, 1200000.00, 0.00, 1200000.00, 'BANK_TRANSFER', 'SEED-T1-Q1-001', TIMESTAMP '2026-01-15 10:00:00'),
    ('T1-Q1-002', 'teacher-1-toeic-reading-revenue', 'seed_student_02', 'SEED10', 900000.00, 90000.00, 810000.00, 'MOMO', 'SEED-T1-Q1-002', TIMESTAMP '2026-02-08 14:30:00'),
    ('T1-Q2-001', 'teacher-1-business-english-revenue', 'seed_student_03', NULL, 1500000.00, 0.00, 1500000.00, 'VNPAY', 'SEED-T1-Q2-001', TIMESTAMP '2026-04-12 09:15:00'),
    ('T1-Q2-002', 'teacher-1-ielts-speaking-revenue', 'seed_student_04', 'SEED15', 1200000.00, 180000.00, 1020000.00, 'BANK_TRANSFER', 'SEED-T1-Q2-002', TIMESTAMP '2026-05-18 16:45:00'),
    ('T1-Q2-003', 'teacher-1-toeic-reading-revenue', 'seed_student_05', NULL, 900000.00, 0.00, 900000.00, 'MOMO', 'SEED-T1-Q2-003', TIMESTAMP '2026-06-20 20:10:00'),
    ('T1-Q3-001', 'teacher-1-business-english-revenue', 'seed_student_01', 'SEED20', 1500000.00, 300000.00, 1200000.00, 'VNPAY', 'SEED-T1-Q3-001', TIMESTAMP '2026-08-02 11:20:00'),
    ('T1-Q4-001', 'teacher-1-ielts-speaking-revenue', 'seed_student_02', NULL, 1200000.00, 0.00, 1200000.00, 'BANK_TRANSFER', 'SEED-T1-Q4-001', TIMESTAMP '2026-11-05 08:00:00')
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
    po.voucher_code,
    po.original_amount,
    po.discount_amount,
    po.total_amount,
    po.payment_method,
    po.payment_reference,
    'PAID',
    po.paid_at,
    po.paid_at,
    NULL
FROM paid_orders po
JOIN courses c ON c.slug = po.course_slug
JOIN users u ON u.username = po.student_username
WHERE NOT EXISTS (
    SELECT 1
    FROM course_orders existing
    WHERE existing.payment_reference = po.payment_reference
);

INSERT INTO course_enrollments (course_id, student_id, purchased_at)
SELECT DISTINCT o.course_id, o.student_id, o.paid_at
FROM course_orders o
JOIN courses c ON c.id = o.course_id
WHERE c.teacher_id = 1
  AND o.status = 'PAID'
  AND o.payment_reference LIKE 'SEED-T1-%'
ON CONFLICT (course_id, student_id) DO NOTHING;

UPDATE courses c
SET student_count = counts.enrollment_count,
    updated_at = NOW()
FROM (
    SELECT course_id, COUNT(*)::int AS enrollment_count
    FROM course_enrollments
    GROUP BY course_id
) counts
WHERE c.id = counts.course_id
  AND c.slug IN (
      'teacher-1-ielts-speaking-revenue',
      'teacher-1-toeic-reading-revenue',
      'teacher-1-business-english-revenue'
  );

-- Expected revenue for teacher id=1:
-- Q1 2026: 2 paid orders, grossRevenue = 2,010,000
-- Q2 2026: 3 paid orders, grossRevenue = 3,420,000
-- Q3 2026: 1 paid order,  grossRevenue = 1,200,000
-- Q4 2026: 1 paid order,  grossRevenue = 1,200,000
