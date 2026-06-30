package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoucherResponse {

    private Long id;
    private String code;
    private String name;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean active;
    private Instant startsAt;
    private Instant expiresAt;
    private Long teacherId;
    private String teacherName;
    private java.util.List<Long> applicableCourseIds;
}
