package org.example.tmdt.service;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CommentRequest;
import org.example.tmdt.dto.CommentResponse;
import org.example.tmdt.dto.ReportCommentRequest;
import org.example.tmdt.dto.TeacherActionLogResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.CommentActionLog;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseComment;
import org.example.tmdt.entity.CourseReview;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CommentActionLogRepository;
import org.example.tmdt.repository.CourseCommentRepository;
import org.example.tmdt.repository.CourseReviewRepository;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseCommentService {

    private final CourseCommentRepository commentRepository;
    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final AppUserRepository userRepository;
    private final CommentActionLogRepository actionLogRepository;

    // ─── STUDENT Q&A LECTURE COMMENTS ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommentResponse> getCourseComments(Long courseId) {
        List<CourseComment> rootComments = commentRepository.findActiveRootComments(courseId);
        return rootComments.stream().map(this::toCommentResponse).toList();
    }

    @Transactional
    public CommentResponse createComment(Long courseId, CommentRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khóa học"));

        AppUser user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản người dùng"));

        CourseComment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy bình luận cha"));
            if (!parent.getCourse().getId().equals(courseId)) {
                throw new BadRequestException("Bình luận cha không thuộc về khóa học này");
            }
        }

        CourseComment comment = CourseComment.builder()
                .course(course)
                .user(user)
                .content(request.getContent().trim())
                .parent(parent)
                .isHidden(false)
                .isPinned(false)
                .isReported(false)
                .isDeleted(false)
                .build();

        CourseComment saved = commentRepository.save(comment);
        return toCommentResponse(saved);
    }

    @Transactional
    public void studentReportComment(Long commentId, ReportCommentRequest request) {
        CourseComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bình luận"));

        comment.setIsReported(true);
        if (comment.getReportReason() == null || comment.getReportReason().isBlank()) {
            comment.setReportReason(request.getReason().trim());
        } else {
            comment.setReportReason(comment.getReportReason() + " | " + request.getReason().trim());
        }
        commentRepository.save(comment);
    }

    // ─── TEACHER/ADMIN REVIEW MODERATION ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommentResponse> teacherGetComments(UserPrincipal principal) {
        List<CourseReview> reviews = reviewRepository.findTeacherReviews(principal.getId());
        return reviews.stream().map(this::reviewToCommentResponse).toList();
    }

    @Transactional
    public CommentResponse teacherToggleHideComment(Long commentId, UserPrincipal principal) {
        CourseReview review = getReviewForTeacher(commentId, principal.getId());
        review.setIsHidden(!Boolean.TRUE.equals(review.getIsHidden()));
        CourseReview saved = reviewRepository.save(review);

        // Log action
        actionLogRepository.save(CommentActionLog.builder()
                .actionType(saved.getIsHidden() ? "HIDE" : "UNHIDE")
                .actor(review.getCourse().getTeacher())
                .commentId(review.getId())
                .commentContent(review.getComment())
                .reason("Giảng viên thay đổi trạng thái ẩn/hiện đánh giá")
                .build());

        return reviewToCommentResponse(saved);
    }

    @Transactional
    public CommentResponse teacherTogglePinComment(Long commentId, UserPrincipal principal) {
        CourseReview review = getReviewForTeacher(commentId, principal.getId());
        review.setIsPinned(!Boolean.TRUE.equals(review.getIsPinned()));
        CourseReview saved = reviewRepository.save(review);

        // Log action
        actionLogRepository.save(CommentActionLog.builder()
                .actionType(saved.getIsPinned() ? "PIN" : "UNPIN")
                .actor(review.getCourse().getTeacher())
                .commentId(review.getId())
                .commentContent(review.getComment())
                .reason("Giảng viên thay đổi trạng thái ghim đánh giá")
                .build());

        return reviewToCommentResponse(saved);
    }

    @Transactional
    public void teacherReportComment(Long commentId, ReportCommentRequest request, UserPrincipal principal) {
        CourseReview review = getReviewForTeacher(commentId, principal.getId());
        review.setIsReported(true);
        if (review.getReportReason() == null || review.getReportReason().isBlank()) {
            review.setReportReason("[Giảng viên báo cáo]: " + request.getReason().trim());
        } else {
            review.setReportReason(review.getReportReason() + " | [Giảng viên báo cáo]: " + request.getReason().trim());
        }
        reviewRepository.save(review);

        // Log action
        actionLogRepository.save(CommentActionLog.builder()
                .actionType("REPORT")
                .actor(review.getCourse().getTeacher())
                .commentId(review.getId())
                .commentContent(review.getComment())
                .reason(request.getReason().trim())
                .build());
    }

    @Transactional
    public CommentResponse teacherReplyReview(Long commentId, CommentRequest request, UserPrincipal principal) {
        CourseReview review = getReviewForTeacher(commentId, principal.getId());
        review.setReplyComment(request.getContent().trim());
        CourseReview saved = reviewRepository.save(review);

        // Log action
        actionLogRepository.save(CommentActionLog.builder()
                .actionType("REPLY")
                .actor(review.getCourse().getTeacher())
                .commentId(review.getId())
                .commentContent(review.getComment())
                .reason("Giảng viên trả lời nhận xét: " + request.getContent().trim())
                .build());

        return reviewToCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> adminGetAllComments() {
        List<CourseReview> reviews = reviewRepository.findAllReviews();
        return reviews.stream().map(this::reviewToCommentResponse).toList();
    }

    @Transactional
    public void adminDeleteComment(Long commentId) {
        CourseReview review = reviewRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá"));
        review.setIsDeleted(true);
        reviewRepository.save(review);
    }

    @Transactional
    public void adminRestoreComment(Long commentId) {
        CourseReview review = reviewRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá"));
        review.setIsDeleted(false);
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<TeacherActionLogResponse> adminGetActionLogs() {
        return actionLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(log -> TeacherActionLogResponse.builder()
                        .id(log.getId())
                        .actionType(log.getActionType())
                        .teacherId(log.getActor().getId())
                        .teacherDisplayName(log.getActor().getDisplayName() != null ? log.getActor().getDisplayName() : log.getActor().getUsername())
                        .commentId(log.getCommentId())
                        .commentContent(log.getCommentContent())
                        .reason(log.getReason())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────

    private CourseReview getReviewForTeacher(Long reviewId, Long teacherId) {
        CourseReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá"));
        if (review.getCourse().getTeacher() == null || !review.getCourse().getTeacher().getId().equals(teacherId)) {
            throw new BadRequestException("Đánh giá này không thuộc về khóa học của bạn");
        }
        return review;
    }

    private CommentResponse toCommentResponse(CourseComment c) {
        List<CommentResponse> replyResponses = new ArrayList<>();
        if (c.getReplies() != null) {
            replyResponses = c.getReplies().stream()
                    .filter(reply -> !Boolean.TRUE.equals(reply.getIsDeleted()) && !Boolean.TRUE.equals(reply.getIsHidden()))
                    .map(this::toCommentResponse)
                    .toList();
        }

        String userRole = "STUDENT";
        if (c.getUser().getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN"))) {
            userRole = "ADMIN";
        } else if (c.getUser().getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_TEACHER"))) {
            userRole = "TEACHER";
        }

        return CommentResponse.builder()
                .id(c.getId())
                .courseId(c.getCourse().getId())
                .courseTitle(c.getCourse().getTitle())
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .userDisplayName(c.getUser().getDisplayName() != null ? c.getUser().getDisplayName() : c.getUser().getUsername())
                .userRole(userRole)
                .content(c.getContent())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .replies(replyResponses)
                .isHidden(c.getIsHidden())
                .isPinned(c.getIsPinned())
                .isReported(c.getIsReported())
                .reportReason(c.getReportReason())
                .isDeleted(c.getIsDeleted())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CommentResponse reviewToCommentResponse(CourseReview r) {
        List<CommentResponse> replyResponses = new ArrayList<>();
        if (r.getReplyComment() != null && !r.getReplyComment().isBlank()) {
            String teacherName = r.getCourse().getTeacher().getDisplayName() != null 
                    ? r.getCourse().getTeacher().getDisplayName() 
                    : r.getCourse().getTeacher().getUsername();

            replyResponses.add(CommentResponse.builder()
                    .id(-r.getId()) // Dùng ID âm để tránh trùng lặp
                    .courseId(r.getCourse().getId())
                    .courseTitle(r.getCourse().getTitle())
                    .userId(r.getCourse().getTeacher().getId())
                    .username(r.getCourse().getTeacher().getUsername())
                    .userDisplayName(teacherName)
                    .userRole("TEACHER")
                    .content(r.getReplyComment())
                    .parentId(r.getId())
                    .createdAt(r.getCreatedAt())
                    .build());
        }

        return CommentResponse.builder()
                .id(r.getId())
                .courseId(r.getCourse().getId())
                .courseTitle(r.getCourse().getTitle())
                .userId(r.getStudentId())
                .username("student_" + r.getStudentId())
                .userDisplayName(r.getStudentName() != null ? r.getStudentName() : "Học viên ẩn danh")
                .userRole("STUDENT")
                .content(r.getComment() + " (" + r.getRating() + " ★)")
                .replies(replyResponses)
                .isHidden(r.getIsHidden())
                .isPinned(r.getIsPinned())
                .isReported(r.getIsReported())
                .reportReason(r.getReportReason())
                .isDeleted(r.getIsDeleted())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getCreatedAt())
                .build();
    }
}
