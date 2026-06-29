package org.example.tmdt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ChangePasswordRequest;
import org.example.tmdt.dto.UpdateProfileRequest;
import org.example.tmdt.dto.UserResponse;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.ProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return profileService.updateProfile(request, principal);
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public UserResponse changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return profileService.changePassword(request, principal);
    }
}
