-- Seed paid orders/revenue for teacher 'ha_truong_teacher'.
-- Run after the application has created tables.

-- Ensure the teacher user exists and get their ID
SET @teacher_id = (SELECT id FROM users WHERE username = 'ha_truong_teacher' LIMIT 1);

-- Ensure Roles Exist
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_STUDENT'),
    ('ROLE_TEACHER');

-- Assign ROLE_TEACHER to Teacher
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT @teacher_id, r.id
FROM roles r
WHERE r.name = 'ROLE_TEACHER';

-- Create Students
INSERT INTO users (username, email, password, enabled, display_name, avatar_url, created_at, updated_at)
VALUES
    ('seed_student_01', 'seed_student_01@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Tran Minh Anh', NULL, NOW(), NOW()),
    ('seed_student_02', 'seed_student_02@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Le Bao Ngoc', NULL, NOW(), NOW()),
    ('seed_student_03', 'seed_student_03@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Pham Hoai Nam', NULL, NOW(), NOW()),
    ('seed_student_04', 'seed_student_04@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Do Mai Linh', NULL, NOW(), NOW()),
    ('seed_student_05', 'seed_student_05@example.com', '$2a$10$seededpasswordhashseededpasswordhashseededpasswordha', TRUE, 'Hoang Anh Thu', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    enabled = TRUE,
    updated_at = NOW();

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_STUDENT'
WHERE u.username IN ('seed_student_01', 'seed_student_02', 'seed_student_03', 'seed_student_04', 'seed_student_05');

-- Create Courses corresponding to the Teacher
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
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE username = 'ha_truong_teacher' LIMIT 1),
    'Trung cap',
    'INTERMEDIATE',
    'IELTS',
    'APPROVED',
    NULL,
    @teacher_id,
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
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE username = 'ha_truong_teacher' LIMIT 1),
    'Co ban',
    'BEGINNER',
    'TOEIC',
    'APPROVED',
    NULL,
    @teacher_id,
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
    (SELECT COALESCE(NULLIF(display_name, ''), username) FROM users WHERE username = 'ha_truong_teacher' LIMIT 1),
    'Trung cap',
    'INTERMEDIATE',
    'COMMUNICATION',
    'APPROVED',
    NULL,
    @teacher_id,
    0,
    28,
    '22h 00m',
    4.90,
    16,
    TRUE,
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    teacher_id = VALUES(teacher_id),
    instructor_name = VALUES(instructor_name),
    status = 'APPROVED',
    active = TRUE,
    updated_at = NOW();

-- Create paid orders
INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, NULL, 1200000.00, 0.00, 1200000.00, 'BANK_TRANSFER', 'SEED-T1-Q1-001', 'PAID', '2026-01-15 10:00:00', '2026-01-15 10:00:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-ielts-speaking-revenue' AND u.username = 'seed_student_01'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q1-001');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, 'SEED10', 900000.00, 90000.00, 810000.00, 'MOMO', 'SEED-T1-Q1-002', 'PAID', '2026-02-08 14:30:00', '2026-02-08 14:30:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-toeic-reading-revenue' AND u.username = 'seed_student_02'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q1-002');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, NULL, 1500000.00, 0.00, 1500000.00, 'VNPAY', 'SEED-T1-Q2-001', 'PAID', '2026-04-12 09:15:00', '2026-04-12 09:15:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-business-english-revenue' AND u.username = 'seed_student_03'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q2-001');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, 'SEED15', 1200000.00, 180000.00, 1020000.00, 'BANK_TRANSFER', 'SEED-T1-Q2-002', 'PAID', '2026-05-18 16:45:00', '2026-05-18 16:45:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-ielts-speaking-revenue' AND u.username = 'seed_student_04'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q2-002');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, NULL, 900000.00, 0.00, 900000.00, 'MOMO', 'SEED-T1-Q2-003', 'PAID', '2026-06-20 20:10:00', '2026-06-20 20:10:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-toeic-reading-revenue' AND u.username = 'seed_student_05'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q2-003');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, 'SEED20', 1500000.00, 300000.00, 1200000.00, 'VNPAY', 'SEED-T1-Q3-001', 'PAID', '2026-08-02 11:20:00', '2026-08-02 11:20:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-business-english-revenue' AND u.username = 'seed_student_01'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q3-001');

INSERT INTO course_orders (course_id, student_id, voucher_code, original_amount, discount_amount, total_amount, payment_method, payment_reference, status, created_at, paid_at, cancelled_at)
SELECT c.id, u.id, NULL, 1200000.00, 0.00, 1200000.00, 'BANK_TRANSFER', 'SEED-T1-Q4-001', 'PAID', '2026-11-05 08:00:00', '2026-11-05 08:00:00', NULL
FROM courses c, users u WHERE c.slug = 'teacher-1-ielts-speaking-revenue' AND u.username = 'seed_student_02'
  AND NOT EXISTS (SELECT 1 FROM course_orders WHERE payment_reference = 'SEED-T1-Q4-001');

-- Enroll students based on paid orders
INSERT IGNORE INTO course_enrollments (course_id, student_id, purchased_at)
SELECT DISTINCT o.course_id, o.student_id, o.paid_at
FROM course_orders o
JOIN courses c ON c.id = o.course_id
WHERE c.teacher_id = @teacher_id
  AND o.status = 'PAID'
  AND o.payment_reference LIKE 'SEED-T1-%';

-- Update student counts
UPDATE courses c
JOIN (
    SELECT course_id, COUNT(*) AS enrollment_count
    FROM course_enrollments
    GROUP BY course_id
) counts ON c.id = counts.course_id
SET c.student_count = counts.enrollment_count,
    c.updated_at = NOW()
WHERE c.slug IN (
    'teacher-1-ielts-speaking-revenue',
    'teacher-1-toeic-reading-revenue',
    'teacher-1-business-english-revenue'
);
