-- Sample English course data for PostgreSQL.
-- Run this after the application has created/updated the schema.

INSERT INTO courses (
    slug,
    title,
    description,
    price,
    thumbnail_url,
    instructor_name,
    language,
    level,
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
    'ielts-foundation-5-5',
    'IELTS Foundation 5.5',
    'Khoa hoc nen tang cho nguoi moi bat dau IELTS, tap trung ngu phap, tu vung va 4 ky nang co ban.',
    990000.00,
    'https://images.unsplash.com/photo-1513258496099-48168024aec0',
    'Co Mai Anh',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    860,
    36,
    '24h 30m',
    4.70,
    215,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-6-5-intensive',
    'IELTS 6.5 Intensive',
    'Lo trinh tang toc giup hoc vien dat muc tieu IELTS 6.5 voi chien luoc lam bai va bai tap thuc chien.',
    1290000.00,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    'Thay Minh Quan',
    'Trung cap',
    'INTERMEDIATE',
    'APPROVED',
    NULL,
    NULL,
    1520,
    44,
    '31h 20m',
    4.80,
    438,
    TRUE,
    NOW(),
    NOW()
),
(
    'ielts-writing-masterclass',
    'IELTS Writing Masterclass',
    'Chuyen sau Writing Task 1 va Task 2, huong dan lap dan y, phat trien y va sua loi thuong gap.',
    850000.00,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    'Co Linh Pham',
    'Trung cap',
    'INTERMEDIATE',
    'APPROVED',
    NULL,
    NULL,
    730,
    28,
    '18h 45m',
    4.85,
    198,
    TRUE,
    NOW(),
    NOW()
),
(
    'toeic-650-cap-toc',
    'TOEIC 650 Cap Toc',
    'Khoa hoc TOEIC tap trung Listening va Reading, phu hop nguoi can diem dau ra trong thoi gian ngan.',
    790000.00,
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    'Thay Hoang Nam',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    2140,
    40,
    '26h 10m',
    4.75,
    512,
    TRUE,
    NOW(),
    NOW()
),
(
    'toeic-800-mastery',
    'TOEIC 800 Mastery',
    'Lo trinh nang diem TOEIC 800+ voi bai tap nang cao, meo xu ly bay dap an va de thi thu.',
    1190000.00,
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
    'Co Thu Ha',
    'Nang cao',
    'ADVANCED',
    'APPROVED',
    NULL,
    NULL,
    980,
    46,
    '33h 00m',
    4.88,
    276,
    TRUE,
    NOW(),
    NOW()
),
(
    'english-communication-basic',
    'Giao Tiep Tieng Anh Co Ban',
    'Luyen phan xa giao tiep hang ngay, phat am, hoi thoai thong dung va tu tin noi tieng Anh.',
    590000.00,
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    'Co Ngan Tran',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    3120,
    32,
    '20h 00m',
    4.65,
    690,
    TRUE,
    NOW(),
    NOW()
),
(
    'business-english',
    'Business English For Work',
    'Tieng Anh cong so cho email, meeting, presentation, negotiation va phong van bang tieng Anh.',
    1390000.00,
    'https://images.unsplash.com/photo-1556761175-b413da4baf72',
    'Thay David Nguyen',
    'Trung cap',
    'INTERMEDIATE',
    'APPROVED',
    NULL,
    NULL,
    640,
    34,
    '22h 40m',
    4.82,
    154,
    TRUE,
    NOW(),
    NOW()
),
(
    'pronunciation-shadowing',
    'Pronunciation & Shadowing',
    'Sua phat am, trong am, noi am va luyen shadowing de noi tu nhien hon.',
    690000.00,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    'Co Bao Chau',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    1180,
    24,
    '15h 30m',
    4.78,
    231,
    TRUE,
    NOW(),
    NOW()
),
(
    'grammar-for-speaking',
    'Grammar For Speaking',
    'Hoc ngu phap ung dung vao noi, giup cau noi dung hon va tu nhien hon trong giao tiep.',
    650000.00,
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
    'Thay Quoc Huy',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    890,
    30,
    '17h 15m',
    4.62,
    145,
    TRUE,
    NOW(),
    NOW()
),
(
    'english-for-kids',
    'English For Kids',
    'Khoa hoc tieng Anh cho tre em voi tu vung, mau cau, bai hat va hoat dong tuong tac.',
    720000.00,
    'https://images.unsplash.com/photo-1503676382389-4809596d5290',
    'Co Thanh Tam',
    'Co ban',
    'BEGINNER',
    'APPROVED',
    NULL,
    NULL,
    1760,
    35,
    '21h 10m',
    4.73,
    382,
    TRUE,
    NOW(),
    NOW()
);

WITH course_data(slug, sort_order, outcome) AS (
    VALUES
    ('ielts-foundation-5-5', 0, 'Nam vung format de thi IELTS'),
    ('ielts-foundation-5-5', 1, 'Xay dung nen tang tu vung va ngu phap'),
    ('ielts-foundation-5-5', 2, 'Luyen 4 ky nang o muc co ban'),
    ('ielts-6-5-intensive', 0, 'Tang toc Listening va Reading'),
    ('ielts-6-5-intensive', 1, 'Viet bai Task 1 va Task 2 dung cau truc'),
    ('ielts-6-5-intensive', 2, 'Luyen Speaking theo chu de thuong gap'),
    ('ielts-writing-masterclass', 0, 'Lap dan y nhanh cho Task 2'),
    ('ielts-writing-masterclass', 1, 'Mo ta bieu do Task 1 ro rang'),
    ('ielts-writing-masterclass', 2, 'Giam loi ngu phap va tu vung'),
    ('toeic-650-cap-toc', 0, 'Nam chien luoc lam bai TOEIC'),
    ('toeic-650-cap-toc', 1, 'Cai thien toc do doc hieu'),
    ('toeic-650-cap-toc', 2, 'Luyen nghe theo part'),
    ('toeic-800-mastery', 0, 'Xu ly cau hoi nang cao'),
    ('toeic-800-mastery', 1, 'Tranh bay dap an thuong gap'),
    ('toeic-800-mastery', 2, 'Lam de thi thu co giai thich'),
    ('english-communication-basic', 0, 'Phan xa hoi dap hang ngay'),
    ('english-communication-basic', 1, 'Tu tin gioi thieu ban than'),
    ('english-communication-basic', 2, 'Noi cau don gian dung ngu canh'),
    ('business-english', 0, 'Viet email cong viec chuyen nghiep'),
    ('business-english', 1, 'Tham gia meeting bang tieng Anh'),
    ('business-english', 2, 'Trinh bay y tuong ro rang'),
    ('pronunciation-shadowing', 0, 'Sua am kho trong tieng Anh'),
    ('pronunciation-shadowing', 1, 'Luyen trong am va ngu dieu'),
    ('pronunciation-shadowing', 2, 'Shadowing theo audio mau'),
    ('grammar-for-speaking', 0, 'Dung thi co ban khi noi'),
    ('grammar-for-speaking', 1, 'Noi cau dai hon va ro nghia'),
    ('grammar-for-speaking', 2, 'Giam loi ngu phap pho bien'),
    ('english-for-kids', 0, 'Hoc tu vung qua hinh anh'),
    ('english-for-kids', 1, 'Luyen cau giao tiep don gian'),
    ('english-for-kids', 2, 'Hoc qua bai hat va tro choi')
)
INSERT INTO course_outcomes (course_id, sort_order, outcome)
SELECT c.id, cd.sort_order, cd.outcome
FROM course_data cd
JOIN courses c ON c.slug = cd.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM course_outcomes co
    WHERE co.course_id = c.id
      AND co.sort_order = cd.sort_order
);

WITH course_data(slug, sort_order, benefit) AS (
    VALUES
    ('ielts-foundation-5-5', 0, 'Truy cap tron doi'),
    ('ielts-foundation-5-5', 1, 'Bai tap sau moi buoi'),
    ('ielts-foundation-5-5', 2, 'Chung chi hoan thanh'),
    ('ielts-6-5-intensive', 0, 'De thi thu dinh ky'),
    ('ielts-6-5-intensive', 1, 'Ho tro hoc tap 1-1'),
    ('ielts-6-5-intensive', 2, 'Tai lieu doc quyen'),
    ('ielts-writing-masterclass', 0, 'Bai mau band cao'),
    ('ielts-writing-masterclass', 1, 'Checklist sua bai'),
    ('ielts-writing-masterclass', 2, 'Luyen viet theo chu de'),
    ('toeic-650-cap-toc', 0, 'Bo de luyen TOEIC'),
    ('toeic-650-cap-toc', 1, 'Giai thich dap an chi tiet'),
    ('toeic-650-cap-toc', 2, 'Chung chi hoan thanh'),
    ('toeic-800-mastery', 0, 'De kho nang cao'),
    ('toeic-800-mastery', 1, 'Phan tich loi sai'),
    ('toeic-800-mastery', 2, 'Lich hoc linh hoat'),
    ('english-communication-basic', 0, 'Hoi thoai mau'),
    ('english-communication-basic', 1, 'Luyen noi hang ngay'),
    ('english-communication-basic', 2, 'Truy cap tron doi'),
    ('business-english', 0, 'Mau email cong viec'),
    ('business-english', 1, 'Kich ban meeting'),
    ('business-english', 2, 'Bai tap presentation'),
    ('pronunciation-shadowing', 0, 'Audio mau chat luong cao'),
    ('pronunciation-shadowing', 1, 'Bai tap shadowing'),
    ('pronunciation-shadowing', 2, 'Theo doi tien bo'),
    ('grammar-for-speaking', 0, 'Vi du thuc te'),
    ('grammar-for-speaking', 1, 'Bai tap ung dung'),
    ('grammar-for-speaking', 2, 'On tap ngu phap cot loi'),
    ('english-for-kids', 0, 'Bai hoc sinh dong'),
    ('english-for-kids', 1, 'Phieu bai tap cho tre'),
    ('english-for-kids', 2, 'Hoat dong tuong tac')
)
INSERT INTO course_benefits (course_id, sort_order, benefit)
SELECT c.id, cd.sort_order, cd.benefit
FROM course_data cd
JOIN courses c ON c.slug = cd.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM course_benefits cb
    WHERE cb.course_id = c.id
      AND cb.sort_order = cd.sort_order
);

WITH section_data(slug, sort_order, title, description, skills, lesson_count, duration) AS (
    VALUES
    ('ielts-foundation-5-5', 0, 'Lam quen IELTS', 'Gioi thieu format bai thi, cach tinh diem va cach lap ke hoach hoc IELTS tu dau. Vi du: xem mot bang diem mau va xac dinh can tang ky nang nao de dat 5.5.', '["Test format","Study planning"]', 6, '3h 20m'),
    ('ielts-foundation-5-5', 1, 'Grammar Foundation', 'On lai cac diem ngu phap cot loi de viet va noi dung hon trong bai thi IELTS. Vi du: viet lai 5 cau don thanh cau phuc dung relative clauses.', '["Grammar","Sentence building"]', 10, '7h 00m'),
    ('ielts-foundation-5-5', 2, 'Vocabulary Builder', 'Mo rong tu vung hoc thuat theo chu de thuong gap trong Listening, Reading va Speaking. Vi du: tao mindmap tu vung chu de environment va dat 6 cau ung dung.', '["Vocabulary","Topic words"]', 8, '5h 10m'),
    ('ielts-foundation-5-5', 3, 'Practice Test', 'Luyen de tong hop va phan tich loi sai sau moi bai test. Vi du: lam mot mini test Reading 20 phut roi ghi lai 3 loi sai lap lai nhieu nhat.', '["Test practice","Error analysis"]', 12, '9h 00m'),
    ('ielts-6-5-intensive', 0, 'IELTS Strategy', 'Xay dung chien luoc lam bai cho muc tieu 6.5, uu tien quan ly thoi gian va do chinh xac. Vi du: chia 60 phut Reading cho 3 passages theo do kho.', '["Test strategy","Time management"]', 6, '4h 00m'),
    ('ielts-6-5-intensive', 1, 'Listening & Reading', 'Luyen ky thuat nghe bat keyword va doc nhanh de xu ly cau hoi kho. Vi du: nghe mot doan Part 3 va danh dau distractor trong transcript.', '["Listening","Reading","Keyword tracking"]', 14, '10h 20m'),
    ('ielts-6-5-intensive', 2, 'Writing Practice', 'Thuc hanh viet Task 1 va Task 2 voi cau truc bai mau va checklist sua loi. Vi du: viet introduction va overview cho line graph ve population growth.', '["Writing Task 1","Writing Task 2"]', 12, '9h 00m'),
    ('ielts-6-5-intensive', 3, 'Speaking Clinic', 'Luyen tra loi Speaking Part 1-3, mo rong y va tang do troi chay. Vi du: tra loi Part 2 chu de memorable trip trong 2 phut bang cue card.', '["Speaking","Fluency","Pronunciation"]', 12, '8h 00m'),
    ('ielts-writing-masterclass', 0, 'Task 1 Essentials', 'Hoc cach phan tich bieu do, chon so lieu noi bat va viet overview ro rang. Vi du: chon 2 xu huong chinh trong bar chart ve energy use.', '["Writing Task 1","Data description"]', 8, '5h 20m'),
    ('ielts-writing-masterclass', 1, 'Task 2 Ideas', 'Luyen phat trien y tuong, lap dan y va trien khai lap luan cho essay. Vi du: lap outline cho de agree/disagree ve online education.', '["Writing Task 2","Idea development"]', 10, '7h 15m'),
    ('ielts-writing-masterclass', 2, 'Error Correction', 'Nhan dien va sua loi ngu phap, tu vung, coherence va task response. Vi du: sua mot doan body paragraph bi lap tu va thieu topic sentence.', '["Error correction","Coherence","Grammar"]', 10, '6h 10m'),
    ('toeic-650-cap-toc', 0, 'TOEIC Overview', 'Nam cau truc de TOEIC, thang diem va chien luoc tang diem nhanh. Vi du: phan loai cau hoi Part 5 thanh grammar, vocabulary va word form.', '["TOEIC format","Test strategy"]', 4, '2h 20m'),
    ('toeic-650-cap-toc', 1, 'Listening Part 1-4', 'Luyen nghe mo ta tranh, hoi dap, hoi thoai va bai noi ngan theo format TOEIC. Vi du: nghe Part 2 va loai dap an khong lien quan den wh-question.', '["Listening","Short conversations"]', 18, '12h 00m'),
    ('toeic-650-cap-toc', 2, 'Reading Part 5-7', 'On ngu phap, tu vung va ky thuat doc hieu cho cac part Reading. Vi du: doc email Part 7 va tim thong tin ngay thang, nguoi gui, muc dich.', '["Reading","Grammar","Vocabulary"]', 18, '11h 50m'),
    ('toeic-800-mastery', 0, 'Advanced Listening', 'Luyen nghe toc do cao, distractor va cac cau hoi suy luan trong TOEIC. Vi du: nghe announcement va suy ra dia diem dang phat thong bao.', '["Advanced listening","Inference"]', 18, '12h 30m'),
    ('toeic-800-mastery', 1, 'Advanced Reading', 'Xu ly bai doc dai, cau hoi thong tin chi tiet va paraphrase kho. Vi du: tim cau paraphrase tu increase thanh rise trong passage kinh doanh.', '["Advanced reading","Paraphrasing"]', 20, '14h 30m'),
    ('toeic-800-mastery', 2, 'Full Tests', 'Lam de thi thu day du va phan tich chien luoc cai thien diem. Vi du: sau de full test, thong ke ty le sai theo tung part de lap ke hoach on.', '["Mock test","Score analysis"]', 8, '6h 00m'),
    ('english-communication-basic', 0, 'Daily Conversation', 'Luyen cac mau hoi dap pho bien trong cong viec, hoc tap va doi song. Vi du: hoi va tra loi ve so thich, lich lam viec, ke hoach cuoi tuan.', '["Speaking","Daily conversation"]', 12, '7h 20m'),
    ('english-communication-basic', 1, 'Speaking Patterns', 'Hoc cau truc cau thong dung de phan xa nhanh hon khi giao tiep. Vi du: dung I would like to, Could you, How about de tao hoi thoai ngan.', '["Speaking patterns","Fluency"]', 10, '6h 40m'),
    ('english-communication-basic', 2, 'Real-life Practice', 'Thuc hanh tinh huong thuc te nhu mua sam, dat lich, hoi duong va gioi thieu ban than. Vi du: dong vai goi dien dat ban nha hang.', '["Role play","Practical speaking"]', 10, '6h 00m'),
    ('business-english', 0, 'Email Writing', 'Viet email cong viec ro rang, lich su va dung muc dich giao tiep. Vi du: viet email xin doi lich hop va dua ra 2 khung gio thay the.', '["Business writing","Email"]', 8, '5h 30m'),
    ('business-english', 1, 'Meetings', 'Luyen ngon ngu can dung khi mo dau, thao luan, dong gop y kien va tong ket meeting. Vi du: dua y kien dong tinh va phan doi lich su trong meeting.', '["Meeting English","Discussion"]', 10, '7h 10m'),
    ('business-english', 2, 'Presentations', 'Xay dung bai thuyet trinh bang tieng Anh voi mo bai, than bai va ket luan thuyet phuc. Vi du: gioi thieu mot san pham trong 3 phut.', '["Presentation","Public speaking"]', 8, '5h 20m'),
    ('business-english', 3, 'Interviews', 'Chuan bi cau tra loi phong van, gioi thieu kinh nghiem va xu ly cau hoi kho. Vi du: tra loi Tell me about yourself bang cau truc present-past-future.', '["Interview","Professional speaking"]', 8, '4h 40m'),
    ('pronunciation-shadowing', 0, 'Core Sounds', 'Sua cac am tieng Anh cot loi va nhan dien khac biet giua cac cap am de nham. Vi du: luyen phan biet ship/sheep va bad/bed.', '["Pronunciation","Core sounds"]', 8, '5h 00m'),
    ('pronunciation-shadowing', 1, 'Stress & Intonation', 'Luyen trong am tu, trong am cau va ngu dieu de noi tu nhien hon. Vi du: doc cau I did not say he stole it voi cac trong am khac nhau.', '["Word stress","Intonation"]', 8, '5h 30m'),
    ('pronunciation-shadowing', 2, 'Shadowing Practice', 'Thuc hanh shadowing theo audio mau de cai thien toc do va do troi chay. Vi du: shadowing mot doan podcast 30 giay theo 3 vong.', '["Shadowing","Fluency"]', 8, '5h 00m'),
    ('grammar-for-speaking', 0, 'Tenses In Speaking', 'Ung dung cac thi co ban vao cau noi hang ngay thay vi hoc ly thuyet tach roi. Vi du: ke ve ngay hom qua bang past simple va past continuous.', '["Tenses","Speaking grammar"]', 10, '5h 45m'),
    ('grammar-for-speaking', 1, 'Sentence Building', 'Xay dung cau dai hon bang conjunctions, clauses va patterns thong dung. Vi du: noi mot cau co because, although va which de mo rong y.', '["Sentence building","Clauses"]', 10, '5h 50m'),
    ('grammar-for-speaking', 2, 'Speaking Drills', 'Luyen noi theo drills de bien ngu phap thanh phan xa tu nhien. Vi du: lap 10 cau hoi Have you ever...? va tra loi bang present perfect.', '["Speaking drills","Accuracy"]', 10, '5h 40m'),
    ('english-for-kids', 0, 'Words & Pictures', 'Hoc tu vung qua hinh anh, mau sac, do vat va chu de gan gui voi tre. Vi du: nhin tranh animal va noi This is a cat, It is black.', '["Vocabulary","Visual learning"]', 12, '7h 00m'),
    ('english-for-kids', 1, 'Songs & Stories', 'Hoc cau tieng Anh don gian qua bai hat va truyen ngan. Vi du: nghe bai Head, Shoulders, Knees and Toes roi chi dung bo phan co the.', '["Listening","Storytelling"]', 12, '7h 10m'),
    ('english-for-kids', 2, 'Fun Practice', 'On tap qua tro choi, hoi dap ngan va hoat dong tuong tac. Vi du: choi bingo tu vung mau sac va noi cau I see something blue.', '["Interaction","Speaking practice"]', 11, '7h 00m')
)
INSERT INTO course_sections (course_id, sort_order, title, description, skills, lesson_count, duration)
SELECT c.id, sd.sort_order, sd.title, sd.description, sd.skills, sd.lesson_count, sd.duration
FROM section_data sd
JOIN courses c ON c.slug = sd.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM course_sections cs
    WHERE cs.course_id = c.id
      AND cs.sort_order = sd.sort_order
);

WITH review_data(slug, sort_order, student_name, rating, comment) AS (
    VALUES
    ('ielts-foundation-5-5', 0, 'Tran Minh A', 5, 'Khoa hoc de hieu, phu hop nguoi moi bat dau.'),
    ('ielts-6-5-intensive', 0, 'Le Bao Ngoc', 5, 'Lo trinh ro rang, bai tap thuc chien va giao vien ho tro tot.'),
    ('ielts-writing-masterclass', 0, 'Pham Hoai Nam', 5, 'Phan Writing rat chi tiet, minh cai thien cach lap luan.'),
    ('toeic-650-cap-toc', 0, 'Nguyen Quang Huy', 4, 'Noi dung bam sat de thi, rat phu hop can dau ra TOEIC.'),
    ('toeic-800-mastery', 0, 'Do Mai Linh', 5, 'Bai nang cao hay, giai thich dap an ky.'),
    ('english-communication-basic', 0, 'Hoang Anh Thu', 5, 'Hoc xong tu tin noi hon trong cac tinh huong hang ngay.'),
    ('business-english', 0, 'Vu Thanh Son', 5, 'Rat huu ich cho cong viec, dac biet phan email va meeting.'),
    ('pronunciation-shadowing', 0, 'Bui Ha My', 4, 'Bai shadowing hay, audio ro va de luyen theo.'),
    ('grammar-for-speaking', 0, 'Dang Tuan Kiet', 4, 'Ngu phap duoc giai thich gan voi giao tiep nen de ap dung.'),
    ('english-for-kids', 0, 'Phu huynh Minh Chau', 5, 'Be nha minh thich bai hoc va hoc tu vung nhanh hon.')
)
INSERT INTO course_reviews (course_id, sort_order, student_name, student_id, rating, comment, created_at)
SELECT c.id, rd.sort_order, rd.student_name, NULL, rd.rating, rd.comment, NOW()
FROM review_data rd
JOIN courses c ON c.slug = rd.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM course_reviews cr
    WHERE cr.course_id = c.id
      AND cr.sort_order = rd.sort_order
);
