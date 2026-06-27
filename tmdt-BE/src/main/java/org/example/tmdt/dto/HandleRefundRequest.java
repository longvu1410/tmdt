package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HandleRefundRequest {

    @NotBlank(message = "Trạng thái quyết định không được để trống")
    private String status; // APPROVED, REJECTED

    private String adminComment;
}
