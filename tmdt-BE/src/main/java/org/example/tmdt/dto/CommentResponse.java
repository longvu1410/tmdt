package org.example.tmdt.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long userId;
    private String username;
    private String userDisplayName;
    private String userRole;
    private String content;
    private Long parentId;
    private List<CommentResponse> replies;
    private Boolean isHidden;
    private Boolean isPinned;
    private Boolean isReported;
    private String reportReason;
    private Boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
}
