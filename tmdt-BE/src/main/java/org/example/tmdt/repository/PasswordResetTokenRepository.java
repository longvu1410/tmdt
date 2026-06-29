package org.example.tmdt.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.example.tmdt.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    List<PasswordResetToken> findAllByUser_IdAndConsumedAtIsNullAndExpiresAtAfter(Long userId, Instant now);
}
