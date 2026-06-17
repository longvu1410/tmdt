package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawalResponse {

    private Long id;
    private Long teacherId;
    private String teacherName;
    private Integer year;
    private Integer quarter;
    private BigDecimal amount;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountName;
    private String note;
    private String status;
    private BigDecimal availableAmount;
    private BigDecimal platformBalance;
    private Long processedByAdminId;
    private String processedByAdminName;
    private String adminNote;
    private Instant createdAt;
    private Instant processedAt;
}
