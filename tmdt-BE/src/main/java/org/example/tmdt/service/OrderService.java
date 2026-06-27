package org.example.tmdt.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.CheckoutRequest;
import org.example.tmdt.dto.CourseOrderResponse;
import org.example.tmdt.dto.OrderPriceResponse;
import org.example.tmdt.dto.PayOrderRequest;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Course;
import org.example.tmdt.entity.CourseEnrollment;
import org.example.tmdt.entity.CourseOrder;
import org.example.tmdt.enums.CourseStatus;
import org.example.tmdt.enums.OrderStatus;
import org.example.tmdt.enums.PaymentMethod;
import org.example.tmdt.entity.Voucher;
import org.example.tmdt.enums.VoucherDiscountType;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.CourseEnrollmentRepository;
import org.example.tmdt.repository.CourseOrderRepository;
import org.example.tmdt.repository.CourseRepository;
import org.example.tmdt.repository.VoucherRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CourseRepository courseRepository;
    private final AppUserRepository appUserRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseOrderRepository courseOrderRepository;
    private final VoucherRepository voucherRepository;

    @Transactional(readOnly = true)
    public OrderPriceResponse preview(CheckoutRequest request) {
        Course course = getPurchasableCourse(request.getCourseId());
        BigDecimal basePrice = course.getDiscountPrice() != null ? course.getDiscountPrice() : course.getPrice();
        Voucher voucher = resolveVoucher(request.getVoucherCode(), basePrice);
        BigDecimal voucherDiscount = calculateDiscount(basePrice, voucher);
        BigDecimal totalAmount = basePrice.subtract(voucherDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDiscount = course.getPrice().subtract(totalAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return OrderPriceResponse.builder()
                .courseId(course.getId())
                .courseSlug(course.getSlug())
                .courseTitle(course.getTitle())
                .voucherCode(voucher == null ? null : voucher.getCode())
                .originalAmount(course.getPrice())
                .discountAmount(totalDiscount)
                .totalAmount(totalAmount)
                .build();
    }


    @Transactional(readOnly = true)
    public List<CourseOrderResponse> getMyOrders(UserPrincipal principal) {
        return courseOrderRepository.findByStudent_IdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseOrderResponse getMyOrder(Long orderId, UserPrincipal principal) {
        return toResponse(getStudentOrder(orderId, principal.getId()));
    }

    @Transactional(readOnly = true)
    public List<CourseOrderResponse> getOrders() {
        return courseOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseOrderResponse checkout(CheckoutRequest request, UserPrincipal principal) {
        Course course = getPurchasableCourse(request.getCourseId());
        if (courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(course.getId(), principal.getId())) {
            throw new BadRequestException("Course already purchased");
        }
        courseOrderRepository.findFirstByCourse_IdAndStudent_IdAndStatusOrderByCreatedAtDesc(
                        course.getId(),
                        principal.getId(),
                        OrderStatus.PENDING)
                .ifPresent(order -> {
                    throw new BadRequestException("A pending order already exists for this course");
                });

        AppUser student = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Student account not found"));
        BigDecimal basePrice = course.getDiscountPrice() != null ? course.getDiscountPrice() : course.getPrice();
        Voucher voucher = resolveVoucher(request.getVoucherCode(), basePrice);
        BigDecimal voucherDiscount = calculateDiscount(basePrice, voucher);
        BigDecimal totalAmount = basePrice.subtract(voucherDiscount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDiscount = course.getPrice().subtract(totalAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        OrderStatus status = totalAmount.compareTo(BigDecimal.ZERO) == 0 ? OrderStatus.PAID : OrderStatus.PENDING;
        Instant paidAt = status == OrderStatus.PAID ? Instant.now() : null;

        CourseOrder order = courseOrderRepository.save(CourseOrder.builder()
                .course(course)
                .student(student)
                .voucherCode(voucher == null ? null : voucher.getCode())
                .originalAmount(course.getPrice())
                .discountAmount(totalDiscount)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod() == null ? PaymentMethod.MOCK : request.getPaymentMethod())
                .status(status)
                .paidAt(paidAt)
                .build());


        if (status == OrderStatus.PAID) {
            completePaidOrder(order, voucher);
        }

        return toResponse(order);
    }

    @Transactional
    public CourseOrderResponse payOrder(Long orderId, PayOrderRequest request, UserPrincipal principal) {
        CourseOrder order = getStudentOrder(orderId, principal.getId());
        if (order.getStatus() == OrderStatus.PAID) {
            return toResponse(order);
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be paid");
        }
        if (courseEnrollmentRepository.existsByCourse_IdAndStudent_Id(order.getCourse().getId(), principal.getId())) {
            throw new BadRequestException("Course already purchased");
        }

        Voucher voucher = order.getVoucherCode() == null ? null : resolveVoucher(order.getVoucherCode(), order.getOriginalAmount());
        order.setPaymentReference(normalizePaymentReference(request));
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(Instant.now());
        completePaidOrder(order, voucher);

        return toResponse(order);
    }

    @Transactional
    public CourseOrderResponse cancelOrder(Long orderId, UserPrincipal principal) {
        CourseOrder order = getStudentOrder(orderId, principal.getId());
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        return toResponse(order);
    }

    private CourseOrder getStudentOrder(Long orderId, Long studentId) {
        CourseOrder order = courseOrderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        if (!order.getStudent().getId().equals(studentId)) {
            throw new NotFoundException("Order not found");
        }
        return order;
    }

    private void completePaidOrder(CourseOrder order, Voucher voucher) {
        if (voucher != null) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
        }
        courseEnrollmentRepository.save(CourseEnrollment.builder()
                .course(order.getCourse())
                .student(order.getStudent())
                .build());
        order.getCourse().setStudentCount(order.getCourse().getStudentCount() + 1);
    }

    private Course getPurchasableCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (!Boolean.TRUE.equals(course.getActive()) || course.getStatus() != CourseStatus.APPROVED) {
            throw new BadRequestException("Only approved courses can be purchased");
        }
        return course;
    }

    private Voucher resolveVoucher(String rawCode, BigDecimal orderAmount) {
        if (rawCode == null || rawCode.isBlank()) {
            return null;
        }
        String code = rawCode.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Voucher not found"));
        validateVoucher(voucher, orderAmount);
        return voucher;
    }

    private void validateVoucher(Voucher voucher, BigDecimal orderAmount) {
        Instant now = Instant.now();
        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new BadRequestException("Voucher is inactive");
        }
        if (voucher.getStartsAt() != null && now.isBefore(voucher.getStartsAt())) {
            throw new BadRequestException("Voucher is not active yet");
        }
        if (voucher.getExpiresAt() != null && now.isAfter(voucher.getExpiresAt())) {
            throw new BadRequestException("Voucher has expired");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Voucher usage limit reached");
        }
        if (orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Order amount does not meet voucher minimum");
        }
    }

    private BigDecimal calculateDiscount(BigDecimal orderAmount, Voucher voucher) {
        if (voucher == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal discount;
        if (voucher.getDiscountType() == VoucherDiscountType.PERCENT) {
            discount = orderAmount.multiply(voucher.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }
        return discount.min(orderAmount).setScale(2, RoundingMode.HALF_UP);
    }

    private OrderPriceResponse toPriceResponse(Course course, Voucher voucher, BigDecimal discountAmount) {
        return OrderPriceResponse.builder()
                .courseId(course.getId())
                .courseSlug(course.getSlug())
                .courseTitle(course.getTitle())
                .voucherCode(voucher == null ? null : voucher.getCode())
                .originalAmount(course.getPrice())
                .discountAmount(discountAmount)
                .totalAmount(course.getPrice().subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private CourseOrderResponse toResponse(CourseOrder order) {
        return CourseOrderResponse.builder()
                .id(order.getId())
                .courseId(order.getCourse().getId())
                .courseSlug(order.getCourse().getSlug())
                .courseTitle(order.getCourse().getTitle())
                .studentId(order.getStudent().getId())
                .voucherCode(order.getVoucherCode())
                .originalAmount(order.getOriginalAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod() == null ? null : order.getPaymentMethod().name())
                .paymentReference(order.getPaymentReference())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .cancelledAt(order.getCancelledAt())
                .build();
    }

    private String normalizePaymentReference(PayOrderRequest request) {
        if (request == null || request.getPaymentReference() == null || request.getPaymentReference().isBlank()) {
            return null;
        }
        return request.getPaymentReference().trim();
    }
}
