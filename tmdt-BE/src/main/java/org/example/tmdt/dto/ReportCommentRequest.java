package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCommentRequest {

    @NotBlank(message = "Lý do báo cáo không được để trống")
    @Size(max = 500, message = "Lý do báo cáo tối đa 500 ký tự")
    private String reason;
}
