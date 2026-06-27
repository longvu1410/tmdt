package org.example.tmdt.service;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ComplaintResponse;
import org.example.tmdt.dto.CreateComplaintRequest;
import org.example.tmdt.dto.HandleComplaintRequest;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseComplaint;
import org.example.tmdt.enums.ComplaintStatus;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseComplaintRepository;
import org.example.tmdt.repository.CourseEnrollmentRepository;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final CourseComplaintRepository complaintRepository;
    private final CourseRepository courseRepository;
    private final AppUserRepository appUserRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final EmailService emailService;

    private static final Map<String, String> TYPE_NAMES = Map.of(
            "CONTENT_QUALITY", "Chất lượng nội dung kém",
            "MISLEADING", "Thông tin sai lệch / Quảng cáo gian dối",
            "REFUND_REQUEST", "Yêu cầu hoàn tiền",
            "TEACHER_BEHAVIOR", "Hành vi giảng viên không phù hợp",
            "OTHER", "Khác"
    );

    private static final Map<ComplaintStatus, String> STATUS_NAMES = Map.of(
            ComplaintStatus.PENDING, "Chờ xử lý",
            ComplaintStatus.REVIEWING, "Đang xem xét",
            ComplaintStatus.RESOLVED, "Đã giải quyết",
            ComplaintStatus.REJECTED, "Không chấp nhận"
    );

    // ── Student: submit complaint ─────────────────────────────────
    @Transactional
    public ComplaintResponse createComplaint(Long courseId, CreateComplaintRequest request, UserPrincipal principal) {
        // Must be enrolled
        if (!enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, principal.getId())) {
            throw new BadRequestException("Bạn chưa mua khóa học này, không thể gửi khiếu nại");
        }

        if (!TYPE_NAMES.containsKey(request.getType())) {
            throw new BadRequestException("Loại khiếu nại không hợp lệ");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khóa học"));
        AppUser student = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        CourseComplaint complaint = CourseComplaint.builder()
                .student(student)
                .course(course)
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .type(request.getType())
                .status(ComplaintStatus.PENDING)
                .build();

        CourseComplaint saved = complaintRepository.save(complaint);

        // Notify admin via email (best effort)
        try {
            String html = buildAdminNotifyEmail(saved, course, student);
            emailService.sendHtml("admin@engmastery.vn",
                    "🚨 Khiếu nại mới #" + saved.getId() + ": " + course.getTitle(), html);
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    // ── Student: view own complaints ──────────────────────────────
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(UserPrincipal principal) {
        return complaintRepository.findByStudent_IdOrderByCreatedAtDesc(principal.getId())
                .stream().map(this::toResponse).toList();
    }

    // ── Student: view complaints for a specific course ────────────
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaintsForCourse(Long courseId, UserPrincipal principal) {
        return complaintRepository.findByStudent_IdAndCourse_IdOrderByCreatedAtDesc(principal.getId(), courseId)
                .stream().map(this::toResponse).toList();
    }

    // ── Admin: view all ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    // ── Admin: view by status ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse).toList();
    }

    // ── Admin: handle complaint ───────────────────────────────────
    @Transactional
    public ComplaintResponse handleComplaint(Long complaintId, HandleComplaintRequest request, UserPrincipal adminPrincipal) {
        CourseComplaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khiếu nại"));

        AppUser admin = appUserRepository.findById(adminPrincipal.getId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Admin"));

        complaint.setStatus(request.getStatus());
        complaint.setAdminResponse(request.getAdminResponse().trim());
        complaint.setHandledByAdmin(admin);

        ComplaintResponse response = toResponse(complaint);

        // Email student
        try {
            String html = buildStudentNotifyEmail(complaint, request.getAdminResponse().trim());
            String subject = request.getStatus() == ComplaintStatus.RESOLVED
                    ? "✅ Khiếu nại của bạn đã được giải quyết"
                    : "📋 Cập nhật trạng thái khiếu nại #" + complaint.getId();
            emailService.sendHtml(complaint.getStudent().getEmail(), subject, html);
        } catch (Exception ignored) {}

        return response;
    }

    // ── Mapper ────────────────────────────────────────────────────
    private ComplaintResponse toResponse(CourseComplaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .courseId(c.getCourse().getId())
                .courseTitle(c.getCourse().getTitle())
                .studentId(c.getStudent().getId())
                .studentName(c.getStudent().getDisplayName() != null ? c.getStudent().getDisplayName() : c.getStudent().getUsername())
                .title(c.getTitle())
                .content(c.getContent())
                .type(c.getType())
                .typeName(TYPE_NAMES.getOrDefault(c.getType(), c.getType()))
                .status(c.getStatus())
                .statusName(STATUS_NAMES.getOrDefault(c.getStatus(), c.getStatus().name()))
                .adminResponse(c.getAdminResponse())
                .handledByAdminName(c.getHandledByAdmin() != null
                        ? (c.getHandledByAdmin().getDisplayName() != null ? c.getHandledByAdmin().getDisplayName() : c.getHandledByAdmin().getUsername())
                        : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    // ── Email templates ───────────────────────────────────────────
    private String buildAdminNotifyEmail(CourseComplaint c, Course course, AppUser student) {
        return "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px'>" +
                "<h2 style='color:#DC2626'>🚨 Khiếu nại mới #" + c.getId() + "</h2>" +
                "<table style='width:100%;border-collapse:collapse;font-size:14px'>" +
                "<tr><td style='padding:8px;color:#6B7280;width:120px'>Học viên:</td><td style='padding:8px;font-weight:600'>" + (student.getDisplayName() != null ? student.getDisplayName() : student.getUsername()) + "</td></tr>" +
                "<tr style='background:#F9FAFB'><td style='padding:8px;color:#6B7280'>Khóa học:</td><td style='padding:8px;font-weight:600'>" + course.getTitle() + "</td></tr>" +
                "<tr><td style='padding:8px;color:#6B7280'>Loại:</td><td style='padding:8px'>" + c.getType() + "</td></tr>" +
                "<tr style='background:#F9FAFB'><td style='padding:8px;color:#6B7280'>Tiêu đề:</td><td style='padding:8px;font-weight:600'>" + c.getTitle() + "</td></tr>" +
                "</table>" +
                "<div style='background:#FEF2F2;border-left:4px solid #DC2626;padding:12px 16px;margin-top:16px;font-size:14px;color:#374151'>" + c.getContent() + "</div>" +
                "<p style='color:#6B7280;font-size:12px;margin-top:24px'>EngMastery Admin Panel</p>" +
                "</div>";
    }

    private String buildStudentNotifyEmail(CourseComplaint c, String adminResponse) {
        String statusColor = c.getStatus() == ComplaintStatus.RESOLVED ? "#059669" : c.getStatus() == ComplaintStatus.REJECTED ? "#DC2626" : "#D97706";
        String statusName = STATUS_NAMES.getOrDefault(c.getStatus(), c.getStatus().name());
        return "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px'>" +
                "<h2 style='color:" + statusColor + "'>Cập nhật khiếu nại #" + c.getId() + "</h2>" +
                "<p>Khiếu nại <b>\"" + c.getTitle() + "\"</b> của bạn về khóa học <b>" + c.getCourse().getTitle() + "</b> đã được cập nhật trạng thái:</p>" +
                "<div style='background:#F9FAFB;border:1px solid #E5E7EB;padding:12px 16px;border-radius:8px;margin:16px 0'>" +
                "<strong style='color:" + statusColor + "'>Trạng thái: " + statusName + "</strong></div>" +
                "<p><strong>Phản hồi từ Admin:</strong></p>" +
                "<blockquote style='background:#F9FAFB;border-left:4px solid #0056D2;padding:12px 16px;color:#374151;font-size:14px'>" + adminResponse + "</blockquote>" +
                "<p style='color:#6B7280;font-size:12px;margin-top:24px'>EngMastery Platform</p>" +
                "</div>";
    }
}
