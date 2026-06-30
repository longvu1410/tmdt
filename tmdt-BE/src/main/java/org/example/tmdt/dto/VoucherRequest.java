package org.example.tmdt.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherRequest {

    @NotBlank
    @Size(max = 40)
    private String code;

    @NotBlank
    @Size(max = 180)
    private String name;

    @NotBlank
    @Size(max = 20)
    private String discountType;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00")
    private BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.00")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Min(1)
    private Integer usageLimit;

    private Boolean active = true;

    private Instant startsAt;

    private Instant expiresAt;

    private java.util.List<Long> applicableCourseIds;
}
