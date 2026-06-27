package org.example.tmdt.service;

import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.AuthResponse;
import org.example.tmdt.dto.LoginRequest;
import org.example.tmdt.dto.RefreshTokenRequest;
import org.example.tmdt.dto.RegisterRequest;
import org.example.tmdt.dto.RegisterResponse;
import org.example.tmdt.dto.UserResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.Role;
import org.example.tmdt.enums.RoleName;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.mapper.UserMapper;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.RoleRepository;
import org.example.tmdt.security.JwtService;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Set<Role> roles = resolveRoles(request.getRequestedRoles());
        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .displayName(request.getResolvedName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .enabled(false)
                .build();
        AppUser savedUser = appUserRepository.save(user);

        boolean emailSent = emailVerificationService.sendVerificationEmail(savedUser);

        return RegisterResponse.builder()
                .message(emailSent
                        ? "Registration successful. Please check your email to verify your account."
                        : "Registration successful. Verification email could not be sent; please use resend verification.")
                .user(userMapper.toResponse(savedUser))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new BadRequestException("Invalid username/email or password"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadRequestException("Invalid username/email or password");
        }

        refreshTokenService.revokeAllByUser(user);
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        AppUser user = refreshTokenService.verifyAndGetUser(request.getRefreshToken());

        refreshTokenService.revokeToken(request.getRefreshToken());
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String newRefreshToken = refreshTokenService.createRefreshToken(user);
        return buildAuthResponse(user, accessToken, newRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        AppUser user = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return userMapper.toResponse(user);
    }

    @Transactional
    public AuthResponse verifyEmail(String token) {
        AppUser user = emailVerificationService.verifyEmail(token);
        refreshTokenService.revokeAllByUser(user);
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        appUserRepository.findByEmail(email.trim())
                .ifPresent(user -> emailVerificationService.sendVerificationEmail(user));
    }

    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        Set<Role> roles = new HashSet<>();
        if (requestedRoles == null || requestedRoles.isEmpty()) {
            roles.add(getRole(RoleName.ROLE_STUDENT));
            return roles;
        }
        if (requestedRoles.size() > 1) {
            throw new BadRequestException("Please choose only one role: STUDENT or TEACHER");
        }

        for (String roleName : requestedRoles) {
            String normalized = roleName.trim().toUpperCase();
            if ("STUDENT".equals(normalized) || "ROLE_STUDENT".equals(normalized)) {
                roles.add(getRole(RoleName.ROLE_STUDENT));
            } else if ("TEACHER".equals(normalized) || "ROLE_TEACHER".equals(normalized)) {
                roles.add(getRole(RoleName.ROLE_TEACHER));
            } else {
                throw new BadRequestException("Registration role must be STUDENT or TEACHER");
            }
        }
        return roles;
    }

    private Role getRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));
    }

    private AuthResponse buildAuthResponse(AppUser user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .user(userMapper.toResponse(user))
                .build();
    }
}
