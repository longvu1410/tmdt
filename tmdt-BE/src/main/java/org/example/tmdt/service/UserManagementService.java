package org.example.tmdt.service;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.UserManagementResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Role;
import org.example.tmdt.enums.RoleName;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.exception.NotFoundException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.RoleRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<UserManagementResponse> getAllUsers() {
        return appUserRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserManagementResponse toggleUserStatus(Long userId, UserPrincipal adminPrincipal) {
        if (userId.equals(adminPrincipal.getId())) {
            throw new BadRequestException("Bạn không thể tự khóa tài khoản của chính mình");
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
        AppUser updated = appUserRepository.save(user);
        return toResponse(updated);
    }

    @Transactional
    public UserManagementResponse updateUserRole(Long userId, String roleStr, UserPrincipal adminPrincipal) {
        if (userId.equals(adminPrincipal.getId())) {
            throw new BadRequestException("Bạn không thể tự thay đổi vai trò của chính mình");
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        RoleName roleName;
        try {
            roleName = RoleName.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Vai trò không hợp lệ. Phải là ROLE_STUDENT, ROLE_TEACHER, hoặc ROLE_ADMIN");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy vai trò trong hệ thống"));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        AppUser updated = appUserRepository.save(user);
        return toResponse(updated);
    }

    @Transactional
    public UserManagementResponse warnUser(Long userId, UserPrincipal adminPrincipal) {
        if (userId.equals(adminPrincipal.getId())) {
            throw new BadRequestException("Bạn không thể tự cảnh cáo chính mình");
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        int warnings = (user.getWarningCount() != null ? user.getWarningCount() : 0) + 1;
        user.setWarningCount(warnings);

        // Auto-ban if warnings reach 3
        if (warnings >= 3) {
            user.setEnabled(false);
        }

        AppUser updated = appUserRepository.save(user);
        return toResponse(updated);
    }

    private UserManagementResponse toResponse(AppUser u) {
        return UserManagementResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .enabled(u.getEnabled())
                .displayName(u.getDisplayName() != null ? u.getDisplayName() : u.getUsername())
                .roles(u.getRoles().stream().map(r -> r.getName().name()).toList())
                .warningCount(u.getWarningCount() != null ? u.getWarningCount() : 0)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
