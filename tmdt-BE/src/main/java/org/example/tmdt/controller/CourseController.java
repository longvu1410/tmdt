package org.example.tmdt.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.example.tmdt.dto.CourseRejectRequest;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CourseRequest;
import org.example.tmdt.dto.CourseResponse;
import org.example.tmdt.dto.CourseTopicResponse;
import org.example.tmdt.dto.SubmitCourseReviewRequest;
import org.example.tmdt.dto.CourseReviewResponse;
import org.example.tmdt.security.UserPrincipal;

import org.example.tmdt.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public List<CourseResponse> getCourses() {
        return courseService.getActiveCourses();
    }

    @GetMapping("/topics")
    public List<CourseTopicResponse> getTopics() {
        return courseService.getTopics();
    }

    @GetMapping("/topics/{topic}")
    public List<CourseResponse> getCoursesByTopic(@PathVariable String topic) {
        return courseService.getActiveCoursesByTopic(topic);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CourseResponse> getPendingCourses() {
        return courseService.getPendingCourses();
    }

    @GetMapping("/admin-all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CourseResponse> getAllCoursesForAdmin() {
        return courseService.getAllCoursesForAdmin();
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse toggleCourseActiveStatus(@PathVariable Long id) {
        return courseService.toggleCourseActiveStatus(id);
    }


    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('TEACHER')")
    public List<CourseResponse> getTeacherCourses(@AuthenticationPrincipal UserPrincipal principal) {
        return courseService.getTeacherCourses(principal);
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return courseService.getCourse(id);
        }
        return courseService.getCourse(id, principal);
    }

    @GetMapping("/slug/{slug}")
    public CourseResponse getCourseBySlug(@PathVariable String slug, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return courseService.getCourse(slug);
        }
        return courseService.getCourse(slug, principal);
    }

    @GetMapping("/detail/{slug}")
    public CourseResponse getCourseDetailBySlug(@PathVariable String slug, @AuthenticationPrincipal UserPrincipal principal) {
        return getCourseBySlug(slug, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public CourseResponse createCourse(
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return courseService.createCourse(request, principal);
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("hasRole('STUDENT')")
    public CourseResponse submitReview(
            @PathVariable Long id,
            @Valid @RequestBody SubmitCourseReviewRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return courseService.submitReview(id, request, principal);
    }

    @GetMapping("/{id}/reviews")
    public List<CourseReviewResponse> getReviews(@PathVariable Long id) {
        return courseService.getReviews(id);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @PutMapping("/{id}/teacher-update")
    @PreAuthorize("hasRole('TEACHER')")
    public CourseResponse teacherUpdateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return courseService.teacherUpdateCourse(id, request, principal);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse approveCourse(@PathVariable Long id) {
        return courseService.approveCourse(id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse rejectCourse(@PathVariable Long id, @Valid @RequestBody CourseRejectRequest request) {
        return courseService.rejectCourse(id, request.getReason());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/{id}/learn")
    @PreAuthorize("isAuthenticated()")
    public CourseResponse getLearnContent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return courseService.getLearningContent(id, principal);
    }
}
