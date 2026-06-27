package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CreateComplaintRequest {

    @NotBlank(message = "Tiêu đề khiếu nại không được để trống")
    @Size(max = 100, message = "Tiêu đề tối đa 100 ký tự")
    private String title;

    @NotBlank(message = "Nội dung khiếu nại không được để trống")
    @Size(min = 20, max = 2000, message = "Nội dung từ 20 đến 2000 ký tự")
    private String content;

    @NotBlank(message = "Vui lòng chọn loại khiếu nại")
    private String type;
}
