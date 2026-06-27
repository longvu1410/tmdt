package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.example.tmdt.enums.ComplaintStatus;

@Getter
public class HandleComplaintRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private ComplaintStatus status;

    @NotBlank(message = "Phản hồi của Admin không được để trống")
    private String adminResponse;
}
