package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowStatsResponse {
    private Long userId;
    private long followersCount;
    private long followingCount;
    private boolean isFollowedByCurrentUser;
}
