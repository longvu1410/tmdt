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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

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
