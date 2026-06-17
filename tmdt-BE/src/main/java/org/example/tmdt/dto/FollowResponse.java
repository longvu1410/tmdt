package org.example.tmdt.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowResponse {
    private Long followerId;
    private Long followingId;
    private String followingUsername;
    private String followingDisplayName;
    private String followingAvatarUrl;
    private boolean following;
    private Instant createdAt;
}
