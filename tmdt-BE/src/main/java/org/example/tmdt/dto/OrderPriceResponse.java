package org.example.tmdt.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderPriceResponse {

    private Long courseId;
    private String courseSlug;
    private String courseTitle;
    private String voucherCode;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
}
