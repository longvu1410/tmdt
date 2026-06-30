package org.example.tmdt;

import org.example.tmdt.dto.CourseRequest;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseReview;
import org.example.tmdt.enums.CourseLevel;
import org.example.tmdt.enums.CourseStatus;
import org.example.tmdt.enums.CourseTopic;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@SpringBootTest
class TmdtApplicationTests {

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void contextLoads() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println(
                encoder.matches(
                        "123456",
                        "$2a$10$ZX0Mo44DqQGA9.KcAAJRa.z08DTNFR3tIhPE2M5m4ufFQbs55rPB."
                )
        );
    }

    @Test
    @Transactional
    void testTeacherUpdateCourseWithReviews() {
        // Find or create a teacher
        AppUser teacher = appUserRepository.findByUsername("teacher_test_user").orElse(null);
        if (teacher == null) {
            teacher = AppUser.builder()
                    .username("teacher_test_user")
                    .email("teacher_test_user@test.com")
                    .password("password")
                    .displayName("Teacher Test")
                    .build();
            teacher = appUserRepository.save(teacher);
        }

        // Create a course
        Course course = Course.builder()
                .title("Test Course")
                .slug("test-course-unique-" + System.currentTimeMillis())
                .description("Description")
                .price(BigDecimal.valueOf(100))
                .instructorName("Teacher Test")
                .language("English")
                .level(CourseLevel.BEGINNER)
                .topic(CourseTopic.GRAMMAR)
                .status(CourseStatus.APPROVED)
                .teacher(teacher)
                .studentCount(0)
                .lessonCount(1)
                .totalDuration("1h")
                .rating(BigDecimal.ZERO)
                .ratingCount(0)
                .active(true)
                .build();
        course = courseRepository.save(course);

        // Add a review directly
        CourseReview review = CourseReview.builder()
                .course(course)
                .studentName("Student")
                .rating(5)
                .comment("Good course")
                .build();
        course.getReviews().add(review);
        course = courseRepository.save(course);

        // Prepare request
        CourseRequest request = new CourseRequest();
        request.setTitle("Updated Test Course");
        request.setSlug(course.getSlug());
        request.setDescription("Updated Description");
        request.setPrice(BigDecimal.valueOf(120));
        request.setInstructorName("Teacher Test");
        request.setLanguage("English");
        request.setLevel("BEGINNER");
        request.setTopic("GRAMMAR");
        request.setStudentCount(0);
        request.setLessonCount(1);
        request.setTotalDuration("1h");
        request.setRating(BigDecimal.ZERO);
        request.setRatingCount(0);
        request.setOutcomes(java.util.List.of("Outcome 1"));
        request.setBenefits(java.util.List.of("Benefit 1"));
        request.setSections(java.util.List.of());
        // Do not add reviews to request (it defaults to empty list in DTO)

        // Run update
        UserPrincipal principal = new UserPrincipal(teacher);
        courseService.teacherUpdateCourse(course.getId(), request, principal);

        // Check that course is updated and reviews are preserved
        Course updatedCourse = courseRepository.findById(course.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Updated Test Course", updatedCourse.getTitle());
        org.junit.jupiter.api.Assertions.assertEquals(1, updatedCourse.getReviews().size());
    }
}
