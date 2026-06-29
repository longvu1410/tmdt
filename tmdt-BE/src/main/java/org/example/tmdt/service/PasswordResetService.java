package org.example.tmdt.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.entity.PasswordResetToken;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final PasswordResetTokenRepository tokenRepository;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.web.base-url:https://app.hatruong.id.vn}")
    private String webBaseUrl;

    @Value("${app.email.reset-password-token-ttl:PT1H}")
    private Duration resetPasswordTokenTtl;

    @Transactional
    public void sendResetEmail(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản với email này"));

        String rawToken = generateToken();
        String tokenHash = sha256Hex(rawToken);
        Instant expiresAt = Instant.now().plus(resetPasswordTokenTtl);

        // Revoke any existing active tokens for this user
        Instant now = Instant.now();
        for (PasswordResetToken active : tokenRepository.findAllByUser_IdAndConsumedAtIsNullAndExpiresAtAfter(user.getId(), now)) {
            active.setConsumedAt(now);
        }

        tokenRepository.save(new PasswordResetToken(user, tokenHash, expiresAt));

        String resetLink = webBaseUrl + "/reset-password?token=" + rawToken;
        String subject = "Đặt lại mật khẩu của bạn";
        String html = buildHtml(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(), resetLink);
        
        emailService.sendHtml(user.getEmail(), subject, html);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Mã xác thực đặt lại mật khẩu là bắt buộc");
        }

        String tokenHash = sha256Hex(rawToken.trim());
        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Mã xác thực đặt lại mật khẩu không hợp lệ"));

        Instant now = Instant.now();
        if (token.isConsumed()) {
            throw new BadRequestException("Mã xác thực đặt lại mật khẩu đã được sử dụng");
        }
        if (token.isExpired(now)) {
            throw new BadRequestException("Mã xác thực đặt lại mật khẩu đã hết hạn");
        }

        AppUser user = appUserRepository.findById(token.getUser().getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng sở hữu mã này"));

        user.setPassword(passwordEncoder.encode(newPassword));
        token.setConsumedAt(now);
        
        appUserRepository.save(user);
        tokenRepository.save(token);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String value) {
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
        byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private String buildHtml(String name, String resetLink) {
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:500px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
                  <h2 style="color:#0056D2;margin-top:0;">Đặt lại mật khẩu</h2>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản EngMastery của bạn.</p>
                  <p>Vui lòng nhấn nút dưới đây để đặt lại mật khẩu mới (liên kết có giá trị trong vòng 1 giờ):</p>
                  <p style="text-align:center;margin:28px 0;">
                    <a href="%s" style="display:inline-block;padding:12px 24px;background:#0056D2;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
                      Đặt lại mật khẩu
                    </a>
                  </p>
                  <p style="color:#6b7280;font-size:12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>
                </div>
                """.formatted(escapeHtml(name), resetLink);
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
