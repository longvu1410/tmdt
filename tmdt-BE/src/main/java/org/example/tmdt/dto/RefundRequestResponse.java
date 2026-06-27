package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class RefundRequestResponse {
    private Long id;
    private Long orderId;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private BigDecimal amount;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private String adminComment;
    private String handledByAdminName;
    private Instant createdAt;
    private Instant handledAt;
}
