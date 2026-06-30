package org.example.tmdt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CommentRequest;
import org.example.tmdt.dto.CommentResponse;
import org.example.tmdt.dto.ReportCommentRequest;
import org.example.tmdt.dto.TeacherActionLogResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.CourseCommentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseCommentController {

    private final CourseCommentService commentService;

    // ─── STUDENT/PUBLIC ENDPOINTS ────────────────────────────────────────────────

    @GetMapping("/api/courses/{courseId}/comments")
    public List<CommentResponse> getCourseComments(@PathVariable Long courseId) {
        return commentService.getCourseComments(courseId);
    }

    @PostMapping("/api/courses/{courseId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public CommentResponse createComment(
            @PathVariable Long courseId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return commentService.createComment(courseId, request, principal);
    }

    @PostMapping("/api/comments/{commentId}/report")
    @PreAuthorize("isAuthenticated()")
    public void studentReportComment(
            @PathVariable Long commentId,
            @Valid @RequestBody ReportCommentRequest request) {
        commentService.studentReportComment(commentId, request);
    }

    // ─── TEACHER ENDPOINTS ────────────────────────────────────────────────────────

    @GetMapping("/api/teacher/comments")
    @PreAuthorize("hasRole('TEACHER')")
    public List<CommentResponse> teacherGetComments(@AuthenticationPrincipal UserPrincipal principal) {
        return commentService.teacherGetComments(principal);
    }

    @PutMapping("/api/teacher/comments/{commentId}/hide")
    @PreAuthorize("hasRole('TEACHER')")
    public CommentResponse teacherToggleHideComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return commentService.teacherToggleHideComment(commentId, principal);
    }

    @PutMapping("/api/teacher/comments/{commentId}/pin")
    @PreAuthorize("hasRole('TEACHER')")
    public CommentResponse teacherTogglePinComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return commentService.teacherTogglePinComment(commentId, principal);
    }

    @PostMapping("/api/teacher/comments/{commentId}/report")
    @PreAuthorize("hasRole('TEACHER')")
    public void teacherReportComment(
            @PathVariable Long commentId,
            @Valid @RequestBody ReportCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        commentService.teacherReportComment(commentId, request, principal);
    }

    @PutMapping("/api/teacher/comments/{commentId}/reply")
    @PreAuthorize("hasRole('TEACHER')")
    public CommentResponse teacherReplyReview(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return commentService.teacherReplyReview(commentId, request, principal);
    }

    // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────────

    @GetMapping("/api/admin/comments")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CommentResponse> adminGetAllComments() {
        return commentService.adminGetAllComments();
    }

    @DeleteMapping("/api/admin/comments/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void adminDeleteComment(@PathVariable Long commentId) {
        commentService.adminDeleteComment(commentId);
    }

    @PutMapping("/api/admin/comments/{commentId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public void adminRestoreComment(@PathVariable Long commentId) {
        commentService.adminRestoreComment(commentId);
    }

    @GetMapping("/api/admin/comments/action-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TeacherActionLogResponse> adminGetActionLogs() {
        return commentService.adminGetActionLogs();
    }
}
