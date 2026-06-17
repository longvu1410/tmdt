package org.example.tmdt.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWithdrawalRequest {

    @NotNull
    @DecimalMin(value = "1000.00")
    private BigDecimal amount;

    @NotBlank
    @Size(max = 120)
    private String bankName;

    @NotBlank
    @Size(max = 60)
    private String bankAccountNumber;

    @NotBlank
    @Size(max = 120)
    private String bankAccountName;

    @Size(max = 500)
    private String note;
}
