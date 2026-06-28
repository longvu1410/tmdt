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
import org.example.tmdt.entity.EmailVerificationToken;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.repository.AppUserRepository;
import org.example.tmdt.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmailVerificationTokenRepository tokenRepository;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;

    @Value("${app.web.base-url:https://app.hatruong.id.vn}")
    private String webBaseUrl;

    @Value("${app.email.verification-token-ttl:PT24H}")
    private Duration verificationTokenTtl;

    @Transactional
    public boolean sendVerificationEmail(AppUser user) {
        if (Boolean.TRUE.equals(user.getEnabled())) {
            return false;
        }

        String rawToken = generateToken();
        String tokenHash = sha256Hex(rawToken);
        Instant expiresAt = Instant.now().plus(verificationTokenTtl);

        // Revoke any existing active tokens for this user to keep verification single-use.
        Instant now = Instant.now();
        for (EmailVerificationToken active : tokenRepository.findAllByUser_IdAndConsumedAtIsNullAndExpiresAtAfter(user.getId(), now)) {
            active.setConsumedAt(now);
        }

        tokenRepository.save(new EmailVerificationToken(user, tokenHash, expiresAt));

        String verifyLink = webBaseUrl + "/api/auth/verify-email?token=" + rawToken;
        String subject = "Verify your email";
        String html = buildHtml(user.getUsername(), verifyLink);
        try {
            emailService.sendHtml(user.getEmail(), subject, html);
            return true;
        } catch (RuntimeException ex) {
            if (failOnError) {
                throw ex;
            }
            return false;
        }
    }

    @Transactional
    public AppUser verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Verification token is required");
        }

        String tokenHash = sha256Hex(rawToken.trim());
        EmailVerificationToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Verification token is invalid"));

        Instant now = Instant.now();
        if (token.isConsumed()) {
            throw new BadRequestException("Verification token was already used");
        }
        if (token.isExpired(now)) {
            throw new BadRequestException("Verification token is expired");
        }

        AppUser user = appUserRepository.findById(token.getUser().getId())
                .orElseThrow(() -> new BadRequestException("User not found for verification token"));

        user.setEnabled(true);
        token.setConsumedAt(now);
        appUserRepository.save(user);
        tokenRepository.save(token);
        return user;
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

    private String buildHtml(String username, String verifyLink) {
        String safeUsername = username == null ? "" : username;
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.5">
                  <h2>Email verification</h2>
                  <p>Hi %s,</p>
                  <p>Click the button below to verify your email address.</p>
                  <p>
                    <a href="%s" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">
                      Verify email
                    </a>
                  </p>
                  <p>If you didn’t create an account, you can ignore this email.</p>
                </div>
                """.formatted(escapeHtml(safeUsername), verifyLink);
    }

    private String escapeHtml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    @Value("${app.mail.fail-on-error:false}")
    private boolean failOnError;
}
