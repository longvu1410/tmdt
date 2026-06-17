package org.example.tmdt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 60)
    private String username;

    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String displayName;

    @NotBlank
    @Email
    @Size(max = 120)
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    private String password;

    @Size(max = 40)
    private String role;

    @Size(max = 1)
    private Set<String> roles;

    public Set<String> getRequestedRoles() {
        Set<String> requestedRoles = new HashSet<>();
        if (role != null && !role.isBlank()) {
            requestedRoles.add(role);
        }
        if (roles != null) {
            requestedRoles.addAll(roles);
        }
        return requestedRoles;
    }

    public String getResolvedName() {
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        if (displayName != null && !displayName.isBlank()) {
            return displayName.trim();
        }
        return null;
    }
}
