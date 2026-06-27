package org.example.tmdt.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CourseEnrollmentResponse;
import org.example.tmdt.dto.CourseRequest;
import org.example.tmdt.dto.CourseResponse;
import org.example.tmdt.dto.CourseReviewResponse;
import org.example.tmdt.dto.CourseSectionResponse;
import org.example.tmdt.dto.CourseTopicResponse;
import org.example.tmdt.dto.SubmitCourseReviewRequest;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseEnrollment;
import org.example.tmdt.enums.CourseLevel;
import org.example.tmdt.entity.CourseReview;
import org.example.tmdt.entity.CourseSection;
import org.example.tmdt.enums.CourseStatus;
import org.example.tmdt.enums.CourseTopic;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseEnrollmentRepository;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final AppUserRepository appUserRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<CourseResponse> getTeacherCourses(UserPrincipal principal) {
        return courseRepository.findByTeacher_IdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getActiveCourses() {
        return courseRepository.findByActiveTrueAndStatusOrderByCreatedAtDesc(CourseStatus.APPROVED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getActiveCoursesByTopic(String rawTopic) {
        CourseTopic topic = parseTopic(rawTopic);
        return courseRepository.findByActiveTrueAndStatusAndTopicOrderByCreatedAtDesc(CourseStatus.APPROVED, topic)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseTopicResponse> getTopics() {
        List<Course> courses = courseRepository.findByActiveTrueAndStatusOrderByCreatedAtDesc(CourseStatus.APPROVED);
        return List.of(CourseTopic.values())
                .stream()
                .map(topic -> CourseTopicResponse.builder()
                        .code(topic.name())
                        .name(topic.getDisplayName())
                        .icon(topic.getIcon())
                        .courseCount(courses.stream()
                                .filter(course -> topic == resolveTopic(course))
                                .count())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id) {
        return courseRepository.findByIdAndActiveTrueAndStatus(id, CourseStatus.APPROVED)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Course not found"));
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id, UserPrincipal principal) {
        Course course = courseRepository.findByIdAndActiveTrueAndStatus(id, CourseStatus.APPROVED)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return toResponse(course, principal);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(String slug) {
        return courseRepository.findBySlugAndActiveTrueAndStatus(slug, CourseStatus.APPROVED)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Course not found"));
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(String slug, UserPrincipal principal) {
        Course course = courseRepository.findBySlugAndActiveTrueAndStatus(slug, CourseStatus.APPROVED)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return toResponse(course, principal);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getPendingCourses() {
        return courseRepository.findByStatusOrderByCreatedAtDesc(CourseStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCoursesForAdmin() {
        return courseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseResponse toggleCourseActiveStatus(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        course.setActive(!Boolean.TRUE.equals(course.getActive()));
        return toResponse(courseRepository.save(course));
    }


    @Transactional
    public CourseResponse createCourse(CourseRequest request, UserPrincipal principal) {
        String slug = normalizeSlug(request.getSlug());
        if (courseRepository.existsBySlug(slug)) {
            throw new BadRequestException("Course slug already exists");
        }
        Course course = Course.builder().build();
        applyRequest(course, request, slug);
        AppUser teacher = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Teacher account not found"));
        course.setTeacher(teacher);
        if (!isAdmin(principal)) {
            course.setInstructorName(resolveUserName(teacher));
        }
        course.setStatus(isAdmin(principal) ? CourseStatus.APPROVED : CourseStatus.PENDING);
        course.setRejectionReason(null);
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse teacherUpdateCourse(Long id, CourseRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (course.getTeacher() == null || !course.getTeacher().getId().equals(principal.getId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa khóa học này");
        }
        if (course.getStatus() == CourseStatus.APPROVED) {
            // Re-submit for review when editing an approved course
            course.setStatus(CourseStatus.PENDING);
            course.setActive(false);
            course.setRejectionReason(null);
        } else if (course.getStatus() == CourseStatus.REJECTED) {
            course.setStatus(CourseStatus.PENDING);
            course.setRejectionReason(null);
        }
        String slug = normalizeSlug(request.getSlug());
        if (!course.getSlug().equals(slug) && courseRepository.existsBySlug(slug)) {
            throw new BadRequestException("Course slug already exists");
        }
        applyRequest(course, request, slug);
        // Keep teacher's actual name
        AppUser teacher = course.getTeacher();
        if (teacher != null) {
            course.setInstructorName(resolveUserName(teacher));
        }
        return toResponse(course);
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        String slug = normalizeSlug(request.getSlug());
        if (!course.getSlug().equals(slug) && courseRepository.existsBySlug(slug)) {
            throw new BadRequestException("Course slug already exists");
        }
        applyRequest(course, request, slug);
        return toResponse(course);
    }

    @Transactional
    public CourseResponse approveCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        course.setStatus(CourseStatus.APPROVED);
        course.setActive(true);
        course.setRejectionReason(null);
        CourseResponse response = toResponse(course);
        // Send email notification
        if (course.getTeacher() != null && course.getTeacher().getEmail() != null) {
            try {
                String html = buildApprovalEmail(course.getTitle(), course.getTeacher().getDisplayName());
                emailService.sendHtml(course.getTeacher().getEmail(),
                        "✅ Khóa học đã được phê duyệt: " + course.getTitle(), html);
            } catch (Exception ignored) { /* don't fail the transaction */ }
        }
        return response;
    }

    @Transactional
    public CourseResponse rejectCourse(Long id, String reason) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        course.setStatus(CourseStatus.REJECTED);
        course.setActive(false);
        course.setRejectionReason(reason.trim());
        CourseResponse response = toResponse(course);
        // Send email notification
        if (course.getTeacher() != null && course.getTeacher().getEmail() != null) {
            try {
                String html = buildRejectionEmail(course.getTitle(), course.getTeacher().getDisplayName(), reason.trim());
                emailService.sendHtml(course.getTeacher().getEmail(),
                        "❌ Khóa học bị từ chối: " + course.getTitle(), html);
            } catch (Exception ignored) { /* don't fail the transaction */ }
        }
        return response;
    }

    private String buildApprovalEmail(String courseTitle, String teacherName) {
        return "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px'>" +
                "<h2 style='color:#059669'>✅ Khóa học đã được phê duyệt!</h2>" +
                "<p>Xin chào <b>" + (teacherName != null ? teacherName : "Giảng viên") + "</b>,</p>" +
                "<p>Khóa học <b>" + courseTitle + "</b> của bạn đã được Admin phê duyệt và xuất bản thành công!</p>" +
                "<p>Học viên có thể tìm thấy và đăng ký học khóa học của bạn ngay bây giờ.</p>" +
                "<p style='color:#6B7280;font-size:13px;margin-top:32px'>EngMastery Platform</p>" +
                "</div>";
    }

    private String buildRejectionEmail(String courseTitle, String teacherName, String reason) {
        return "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px'>" +
                "<h2 style='color:#DC2626'>❌ Khóa học chưa được phê duyệt</h2>" +
                "<p>Xin chào <b>" + (teacherName != null ? teacherName : "Giảng viên") + "</b>,</p>" +
                "<p>Rất tiếc, khóa học <b>" + courseTitle + "</b> của bạn chưa được phê duyệt vì lý do sau:</p>" +
                "<blockquote style='background:#FEF2F2;border-left:4px solid #DC2626;padding:12px 16px;color:#991B1B'>" + reason + "</blockquote>" +
                "<p>Bạn có thể chỉnh sửa nội dung và gửi lại để kiểm duyệt.</p>" +
                "<p style='color:#6B7280;font-size:13px;margin-top:32px'>EngMastery Platform</p>" +
                "</div>";
    }


    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public CourseResponse getLearningContent(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (!courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, principal.getId())) {
            throw new BadRequestException("Bạn chưa mua khóa học này");
        }
        return toResponse(course, principal);
    }

    @Transactional
    public CourseEnrollmentResponse purchaseCourse(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (!Boolean.TRUE.equals(course.getActive()) || course.getStatus() != CourseStatus.APPROVED) {
            throw new BadRequestException("Only approved courses can be purchased");
        }
        if (courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, principal.getId())) {
            CourseEnrollment existing = courseEnrollmentRepository.findByCourse_IdAndStudent_Id(courseId, principal.getId())
                    .orElseThrow(() -> new BadRequestException("Course already purchased"));
            return toEnrollmentResponse(existing);
        }

        AppUser student = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Student account not found"));
        CourseEnrollment enrollment = courseEnrollmentRepository.save(CourseEnrollment.builder()
                .course(course)
                .student(student)
                .build());
        course.setStudentCount(course.getStudentCount() + 1);
        return toEnrollmentResponse(enrollment);
    }

    @Transactional
    public CourseResponse submitReview(Long courseId, SubmitCourseReviewRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (!Boolean.TRUE.equals(course.getActive()) || course.getStatus() != CourseStatus.APPROVED) {
            throw new BadRequestException("Only approved courses can be reviewed");
        }
        if (!courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, principal.getId())) {
            throw new BadRequestException("You can only review courses you have purchased");
        }

        AppUser student = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Student account not found"));
        CourseReview review = course.getReviews()
                .stream()
                .filter(existingReview -> principal.getId().equals(existingReview.getStudentId()))
                .findFirst()
                .orElse(null);

        if (review == null) {
            review = CourseReview.builder()
                    .studentId(student.getId())
                    .studentName(resolveStudentName(student))
                    .createdAt(Instant.now())
                    .build();
            course.getReviews().add(review);
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        review.setStudentName(resolveStudentName(student));
        recalculateRating(course);
        return toResponse(course, principal);
    }

    @Transactional(readOnly = true)
    public List<CourseReviewResponse> getReviews(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return course.getReviews().stream()
                .map(review -> CourseReviewResponse.builder()
                        .studentName(review.getStudentName())
                        .studentId(review.getStudentId())
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .createdAt(review.getCreatedAt())
                        .build())
                .toList();
    }


    private void applyRequest(Course course, CourseRequest request, String slug) {
        course.setSlug(slug);
        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription().trim());
        course.setPrice(request.getPrice());
        course.setDiscountPrice(request.getDiscountPrice());
        course.setThumbnailUrl(trimToNull(request.getThumbnailUrl()));

        course.setInstructorName(request.getInstructorName().trim());
        course.setLanguage(request.getLanguage().trim());
        course.setLevel(parseLevel(request.getLevel()));
        course.setTopic(parseNullableTopic(request.getTopic(), course.getTitle()));
        course.setStudentCount(request.getStudentCount());
        course.setLessonCount(request.getLessonCount());
        course.setTotalDuration(request.getTotalDuration().trim());
        course.setRating(request.getRating());
        course.setRatingCount(request.getRatingCount());
        course.setOutcomes(request.getOutcomes().stream().map(String::trim).toList());
        course.setBenefits(request.getBenefits().stream().map(String::trim).toList());
        course.setSections(request.getSections().stream()
                .map(section -> CourseSection.builder()
                        .title(section.getTitle().trim())
                        .description(trimToNull(section.getDescription()))
                        .skills(section.getSkills().stream().map(String::trim).toList())
                        .lessonCount(section.getLessonCount())
                        .duration(section.getDuration().trim())
                        .videoUrl(trimToNull(section.getVideoUrl()))
                        .build())
                .toList());
        course.setReviews(request.getReviews().stream()
                .map(review -> CourseReview.builder()
                        .studentName(review.getStudentName().trim())
                        .rating(review.getRating())
                        .comment(review.getComment().trim())
                        .build())
                .toList());
        course.setActive(request.getActive() == null || request.getActive());
    }

    private CourseResponse toResponse(Course course) {
        return toResponse(course, null);
    }

    private CourseResponse toResponse(Course course, UserPrincipal principal) {
        boolean purchased = principal != null
                && courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), principal.getId());
        boolean reviewed = principal != null && course.getReviews()
                .stream()
                .anyMatch(review -> principal.getId().equals(review.getStudentId()));
        return CourseResponse.builder()
                .id(course.getId())
                .slug(course.getSlug())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .discountPrice(course.getDiscountPrice())
                .thumbnailUrl(course.getThumbnailUrl())

                .instructorName(course.getInstructorName())
                .language(course.getLanguage())
                .level(course.getLevel().name())
                .topic(resolveTopic(course).name())
                .topicName(resolveTopic(course).getDisplayName())
                .topicIcon(resolveTopic(course).getIcon())
                .status(course.getStatus() == null ? CourseStatus.PENDING.name() : course.getStatus().name())
                .rejectionReason(course.getRejectionReason())
                .teacherId(course.getTeacher() == null ? null : course.getTeacher().getId())
                .teacherName(course.getTeacher() == null ? null : resolveUserName(course.getTeacher()))
                .studentCount(course.getStudentCount())
                .lessonCount(course.getLessonCount())
                .totalDuration(course.getTotalDuration())
                .rating(course.getRating())
                .ratingCount(course.getRatingCount())
                .purchased(purchased)
                .reviewed(reviewed)
                .outcomes(course.getOutcomes())
                .benefits(course.getBenefits())
                .sections(course.getSections().stream()
                        .map(section -> CourseSectionResponse.builder()
                                .title(section.getTitle())
                                .description(section.getDescription())
                                .skills(section.getSkills())
                                .lessonCount(section.getLessonCount())
                                .duration(section.getDuration())
                                .videoUrl(section.getVideoUrl())
                                .build())
                        .toList())
                .reviews(course.getReviews().stream()
                        .map(review -> CourseReviewResponse.builder()
                                .studentName(review.getStudentName())
                                .studentId(review.getStudentId())
                                .rating(review.getRating())
                                .comment(review.getComment())
                                .createdAt(review.getCreatedAt())
                                .build())
                        .toList())
                .build();
    }

    private CourseLevel parseLevel(String level) {
        try {
            return CourseLevel.valueOf(level.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Course level must be BEGINNER, INTERMEDIATE, or ADVANCED");
        }
    }

    private CourseTopic parseNullableTopic(String rawTopic, String title) {
        if (rawTopic == null || rawTopic.isBlank()) {
            return inferTopic(title);
        }
        return parseTopic(rawTopic);
    }

    private CourseTopic parseTopic(String rawTopic) {
        if (rawTopic == null || rawTopic.isBlank()) {
            throw new BadRequestException("Course topic is required");
        }
        String normalized = rawTopic.trim().toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');
        try {
            return CourseTopic.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Course topic must be IELTS, TOEIC, COMMUNICATION, GRAMMAR, PRONUNCIATION, or WRITING");
        }
    }

    private CourseTopic resolveTopic(Course course) {
        if (course.getTopic() != null) {
            return course.getTopic();
        }
        return inferTopic(course.getTitle());
    }

    private CourseTopic inferTopic(String title) {
        String normalized = title == null ? "" : title.toLowerCase();
        if (normalized.contains("toeic")) {
            return CourseTopic.TOEIC;
        }
        if (normalized.contains("ielts")) {
            return CourseTopic.IELTS;
        }
        if (normalized.contains("grammar") || normalized.contains("ngu phap") || normalized.contains("ngữ pháp")) {
            return CourseTopic.GRAMMAR;
        }
        if (normalized.contains("pronunciation") || normalized.contains("phat am") || normalized.contains("phát âm")) {
            return CourseTopic.PRONUNCIATION;
        }
        if (normalized.contains("writing") || normalized.contains("viet") || normalized.contains("viết")) {
            return CourseTopic.WRITING;
        }
        return CourseTopic.COMMUNICATION;
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal.getAuthorities()
                .stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private CourseEnrollmentResponse toEnrollmentResponse(CourseEnrollment enrollment) {
        return CourseEnrollmentResponse.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseSlug(enrollment.getCourse().getSlug())
                .studentId(enrollment.getStudent().getId())
                .purchasedAt(enrollment.getPurchasedAt())
                .build();
    }

    private String resolveStudentName(AppUser student) {
        return resolveUserName(student);
    }

    private String resolveUserName(AppUser user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        return user.getUsername();
    }

    private void recalculateRating(Course course) {
        List<CourseReview> reviews = course.getReviews();
        course.setRatingCount(reviews.size());
        if (reviews.isEmpty()) {
            course.setRating(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            return;
        }
        double average = reviews.stream()
                .mapToInt(CourseReview::getRating)
                .average()
                .orElse(0);
        course.setRating(BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP));
    }
}
