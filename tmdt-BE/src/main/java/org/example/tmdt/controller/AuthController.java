package org.example.tmdt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.AuthResponse;
import org.example.tmdt.dto.LoginRequest;
import org.example.tmdt.dto.RefreshTokenRequest;
import org.example.tmdt.dto.RegisterRequest;
import org.example.tmdt.dto.RegisterResponse;
import org.example.tmdt.dto.ResendVerificationRequest;
import org.example.tmdt.dto.UserResponse;
import org.example.tmdt.dto.ForgotPasswordRequest;
import org.example.tmdt.dto.ResetPasswordRequest;
import org.example.tmdt.security.UserPrincipal;
import org.example.tmdt.service.AuthService;
import org.example.tmdt.service.PasswordResetService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/verify-email")
    public AuthResponse verifyEmail(@RequestParam("token") String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return Map.of("message", "Verification email sent (if the account exists and is not verified)");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh-token")
    public AuthResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.getCurrentUser(principal);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetEmail(request.getEmail());
        return Map.of("message", "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return Map.of("message", "Mật khẩu của bạn đã được đặt lại thành công.");
    }
}
