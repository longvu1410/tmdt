package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRefundRequest {

    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @NotBlank(message = "Lý do hoàn tiền không được để trống")
    @Size(max = 1000, message = "Lý do hoàn tiền không được dài quá 1000 ký tự")
    private String reason;
}
