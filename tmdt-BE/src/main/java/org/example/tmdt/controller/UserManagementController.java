package org.example.tmdt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.UpdateUserRoleRequest;
import org.example.tmdt.dto.UserManagementResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.UserManagementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public List<UserManagementResponse> getAllUsers() {
        return userManagementService.getAllUsers();
    }

    @PutMapping("/{id}/toggle-status")
    public UserManagementResponse toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        return userManagementService.toggleUserStatus(id, adminPrincipal);
    }

    @PutMapping("/{id}/role")
    public UserManagementResponse updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        return userManagementService.updateUserRole(id, request.getRole(), adminPrincipal);
    }
}
