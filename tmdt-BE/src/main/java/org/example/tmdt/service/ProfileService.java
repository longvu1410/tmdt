package org.example.tmdt.service;

import lombok.RequiredArgsConstructor;
import org.example.tmdt.dto.ChangePasswordRequest;
import org.example.tmdt.dto.UpdateProfileRequest;
import org.example.tmdt.dto.UserResponse;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.mapper.UserMapper;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, UserPrincipal principal) {
        AppUser user = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản người dùng"));

        user.setDisplayName(request.getDisplayName().trim());
        AppUser saved = appUserRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse changePassword(ChangePasswordRequest request, UserPrincipal principal) {
        AppUser user = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản người dùng"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        AppUser saved = appUserRepository.save(user);
        return userMapper.toResponse(saved);
    }
}
