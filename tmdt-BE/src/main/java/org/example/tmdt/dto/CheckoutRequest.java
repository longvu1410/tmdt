package org.example.tmdt.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.tmdt.entity.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {

    @NotNull
    private Long courseId;

    @Size(max = 40)
    private String voucherCode;

    private PaymentMethod paymentMethod = PaymentMethod.MOCK;
}
