package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeacherQuarterRevenueResponse {

    private Long teacherId;
    private String teacherName;
    private Integer year;
    private Integer quarter;
    private Instant periodStart;
    private Instant periodEnd;
    private Long paidOrderCount;
    private Long coursesSoldCount;
    private BigDecimal grossRevenue;
    private BigDecimal pendingWithdrawalAmount;
    private BigDecimal approvedWithdrawalAmount;
    private BigDecimal requestedOrPaidAmount;
    private BigDecimal availableAmount;
    private BigDecimal platformBalance;
}
