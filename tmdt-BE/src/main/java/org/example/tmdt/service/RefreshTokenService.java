package org.example.tmdt.service;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.example.tmdt.entity.AppUser;
import org.example.tmdt.exception.BadRequestException;
import org.example.tmdt.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String TOKEN_KEY_PREFIX = "auth:refresh-token:";
    private static final String USER_TOKEN_SET_PREFIX = "auth:user-refresh-tokens:";

    private final StringRedisTemplate redisTemplate;
    private final AppUserRepository appUserRepository;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public String createRefreshToken(AppUser user) {
        String token = UUID.randomUUID().toString();
        String tokenKey = tokenKey(token);
        String userTokensKey = userTokensKey(user.getId());
        Duration ttl = Duration.ofMillis(refreshTokenExpirationMs);

        redisTemplate.opsForValue().set(tokenKey, String.valueOf(user.getId()), ttl);
        redisTemplate.opsForSet().add(userTokensKey, token);
        redisTemplate.expire(userTokensKey, ttl);
        return token;
    }

    public AppUser verifyAndGetUser(String token) {
        String userIdRaw = redisTemplate.opsForValue().get(tokenKey(token));
        if (userIdRaw == null || userIdRaw.isBlank()) {
            throw new BadRequestException("Refresh token is invalid or expired");
        }

        long userId;
        try {
            userId = Long.parseLong(userIdRaw);
        } catch (NumberFormatException ex) {
            revokeToken(token);
            throw new BadRequestException("Refresh token is invalid");
        }

        return appUserRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found for refresh token"));
    }

    public void revokeToken(String token) {
        String tokenKey = tokenKey(token);
        String userIdRaw = redisTemplate.opsForValue().get(tokenKey);
        redisTemplate.delete(tokenKey);
        if (userIdRaw != null && !userIdRaw.isBlank()) {
            try {
                redisTemplate.opsForSet().remove(userTokensKey(Long.parseLong(userIdRaw)), token);
            } catch (NumberFormatException ignored) {
                // Ignore malformed user id in redis and just remove token key.
            }
        }
    }

    public void revokeAllByUser(AppUser user) {
        String userTokensKey = userTokensKey(user.getId());
        Set<String> userTokens = redisTemplate.opsForSet().members(userTokensKey);
        if (userTokens != null) {
            for (String token : userTokens) {
                redisTemplate.delete(tokenKey(token));
            }
        }
        redisTemplate.delete(userTokensKey);
    }

    private String tokenKey(String token) {
        return TOKEN_KEY_PREFIX + token;
    }

    private String userTokensKey(Long userId) {
        return USER_TOKEN_SET_PREFIX + userId;
    }
}
