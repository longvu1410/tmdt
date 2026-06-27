package org.example.tmdt.service;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CreateRefundRequest;
import org.example.tmdt.dto.HandleRefundRequest;
import org.example.tmdt.dto.RefundRequestResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.CourseEnrollment;
import org.example.tmdt.entity.CourseOrder;
import org.example.tmdt.entity.RefundRequest;
import org.example.tmdt.enums.OrderStatus;
import org.example.tmdt.enums.RefundStatus;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseEnrollmentRepository;
import org.example.tmdt.repository.CourseOrderRepository;
import org.example.tmdt.repository.RefundRequestRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRequestRepository refundRequestRepository;
    private final CourseOrderRepository courseOrderRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final AppUserRepository appUserRepository;
    private final SmtpEmailService emailService;

    @Transactional
    public RefundRequestResponse requestRefund(CreateRefundRequest request, UserPrincipal studentPrincipal) {
        CourseOrder order = courseOrderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getStudent().getId().equals(studentPrincipal.getId())) {
            throw new BadRequestException("Bạn không sở hữu đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Chỉ đơn hàng đã thanh toán mới được yêu cầu hoàn tiền");
        }

        // Kiểm tra xem đã có yêu cầu hoàn tiền đang chờ hoặc đã được duyệt chưa
        boolean exists = refundRequestRepository.existsByOrder_IdAndStatusIn(
                order.getId(),
                List.of(RefundStatus.PENDING, RefundStatus.APPROVED)
        );
        if (exists) {
            throw new BadRequestException("Đơn hàng này đã gửi yêu cầu hoàn tiền hoặc đã hoàn tiền thành công");
        }

        AppUser student = appUserRepository.findById(studentPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Học viên không tồn tại"));

        RefundRequest refundRequest = refundRequestRepository.save(RefundRequest.builder()
                .order(order)
                .student(student)
                .reason(request.getReason().trim())
                .status(RefundStatus.PENDING)
                .build());

        // Gửi email báo cho Admin hoặc hệ thống
        sendAdminNotificationEmail(refundRequest);

        return toResponse(refundRequest);
    }

    @Transactional(readOnly = true)
    public List<RefundRequestResponse> getMyRefundRequests(UserPrincipal studentPrincipal) {
        return refundRequestRepository.findByStudent_IdOrderByCreatedAtDesc(studentPrincipal.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RefundRequestResponse> getAllRefundRequests() {
        return refundRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RefundRequestResponse handleRefundRequest(Long id, HandleRefundRequest request, UserPrincipal adminPrincipal) {
        RefundRequest refundRequest = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu hoàn tiền"));

        if (refundRequest.getStatus() != RefundStatus.PENDING) {
            throw new BadRequestException("Yêu cầu hoàn tiền đã được xử lý trước đó");
        }

        AppUser admin = appUserRepository.findById(adminPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Admin không tồn tại"));

        RefundStatus decision;
        try {
            decision = RefundStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Quyết định không hợp lệ. Phải là APPROVED hoặc REJECTED");
        }

        refundRequest.setStatus(decision);
        refundRequest.setAdminComment(request.getAdminComment() != null ? request.getAdminComment().trim() : null);
        refundRequest.setHandledByAdmin(admin);
        refundRequest.setHandledAt(Instant.now());

        CourseOrder order = refundRequest.getOrder();

        if (decision == RefundStatus.APPROVED) {
            // Cập nhật trạng thái đơn hàng sang REFUNDED
            order.setStatus(OrderStatus.REFUNDED);
            courseOrderRepository.save(order);

            // Xóa quyền học viên khỏi khóa học (xóa Enrollment)
            courseEnrollmentRepository.findByCourse_IdAndStudent_Id(order.getCourse().getId(), refundRequest.getStudent().getId())
                    .ifPresent(courseEnrollmentRepository::delete);

            // Giảm số lượng học viên của khóa học
            if (order.getCourse().getStudentCount() > 0) {
                order.getCourse().setStudentCount(order.getCourse().getStudentCount() - 1);
            }
        }

        RefundRequest updated = refundRequestRepository.save(refundRequest);

        // Gửi email thông báo cho học viên
        sendStudentNotificationEmail(updated);

        return toResponse(updated);
    }

    private void sendAdminNotificationEmail(RefundRequest req) {
        try {
            String title = "🚨 Yêu cầu hoàn tiền mới từ học viên: " + req.getStudent().getUsername();
            String html = "<h3>Có một yêu cầu hoàn tiền mới đang chờ bạn xử lý</h3>" +
                    "<p><b>Mã đơn hàng:</b> #" + req.getOrder().getId() + "</p>" +
                    "<p><b>Khóa học:</b> " + req.getOrder().getCourse().getTitle() + "</p>" +
                    "<p><b>Học viên:</b> " + (req.getStudent().getDisplayName() != null ? req.getStudent().getDisplayName() : req.getStudent().getUsername()) + "</p>" +
                    "<p><b>Số tiền hoàn:</b> " + req.getOrder().getTotalAmount() + "đ</p>" +
                    "<p><b>Lý do hoàn tiền:</b> " + req.getReason() + "</p>" +
                    "<hr/><p><i>Vui lòng đăng nhập trang quản trị để xem chi tiết.</i></p>";
            // Gửi cho admin mặc định (có thể lấy email của admin đầu tiên hoặc hardcode một email)
            emailService.sendHtml("truong@example.com", title, html); // Hoặc email admin chính
        } catch (Exception ignored) {}
    }

    private void sendStudentNotificationEmail(RefundRequest req) {
        try {
            boolean isApproved = req.getStatus() == RefundStatus.APPROVED;
            String statusStr = isApproved ? "được PHÊ DUYỆT" : "bị TỪ CHỐI";
            String title = (isApproved ? "✅ Yêu cầu hoàn tiền của bạn đã được duyệt" : "❌ Yêu cầu hoàn tiền của bạn đã bị từ chối") + " - " + req.getOrder().getCourse().getTitle();
            String html = "<h3>Thông báo kết quả yêu cầu hoàn tiền</h3>" +
                    "<p>Xin chào <b>" + (req.getStudent().getDisplayName() != null ? req.getStudent().getDisplayName() : req.getStudent().getUsername()) + "</b>,</p>" +
                    "<p>Yêu cầu hoàn tiền của bạn cho đơn hàng <b>#" + req.getOrder().getId() + "</b> (Khóa học: " + req.getOrder().getCourse().getTitle() + ") đã " + statusStr + ".</p>" +
                    (req.getAdminComment() != null && !req.getAdminComment().isBlank() ? "<p><b>Ý kiến phản hồi từ Admin:</b> " + req.getAdminComment() + "</p>" : "") +
                    "<p>Cảm ơn bạn đã sử dụng dịch vụ của EngMastery.</p>";
            if (req.getStudent().getEmail() != null) {
                emailService.sendHtml(req.getStudent().getEmail(), title, html);
            }
        } catch (Exception ignored) {}
    }

    private RefundRequestResponse toResponse(RefundRequest r) {
        return RefundRequestResponse.builder()
                .id(r.getId())
                .orderId(r.getOrder().getId())
                .courseId(r.getOrder().getCourse().getId())
                .courseTitle(r.getOrder().getCourse().getTitle())
                .courseSlug(r.getOrder().getCourse().getSlug())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getDisplayName() != null ? r.getStudent().getDisplayName() : r.getStudent().getUsername())
                .studentEmail(r.getStudent().getEmail())
                .amount(r.getOrder().getTotalAmount())
                .reason(r.getReason())
                .status(r.getStatus().name())
                .adminComment(r.getAdminComment())
                .handledByAdminName(r.getHandledByAdmin() != null ? (r.getHandledByAdmin().getDisplayName() != null ? r.getHandledByAdmin().getDisplayName() : r.getHandledByAdmin().getUsername()) : null)
                .createdAt(r.getCreatedAt())
                .handledAt(r.getHandledAt())
                .build();
    }
}
