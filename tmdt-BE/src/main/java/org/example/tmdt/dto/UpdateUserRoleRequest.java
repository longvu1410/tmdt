package org.example.tmdt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRoleRequest {
    @NotBlank(message = "Vai trò không được để trống")
    private String role; // e.g. ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN
}
