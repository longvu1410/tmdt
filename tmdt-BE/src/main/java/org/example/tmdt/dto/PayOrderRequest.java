package org.example.tmdt.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayOrderRequest {

    @Size(max = 120)
    private String paymentReference;
}
