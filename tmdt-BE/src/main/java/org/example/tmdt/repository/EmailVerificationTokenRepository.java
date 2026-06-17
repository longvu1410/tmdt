package org.example.tmdt.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.example.tmdt.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    List<EmailVerificationToken> findAllByUser_IdAndConsumedAtIsNullAndExpiresAtAfter(Long userId, Instant now);
}
