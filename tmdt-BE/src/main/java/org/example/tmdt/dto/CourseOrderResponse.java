package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseOrderResponse {

    private Long id;
    private Long courseId;
    private String courseSlug;
    private String courseTitle;
    private Long studentId;
    private String voucherCode;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentReference;
    private String status;
    private Instant createdAt;
    private Instant paidAt;
    private Instant cancelledAt;
}
