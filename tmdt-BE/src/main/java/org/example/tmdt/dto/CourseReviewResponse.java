package org.example.tmdt.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseReviewResponse {
    private Long id;
    private String studentName;
    private Long studentId;
    private Integer rating;
    private String comment;
    private Instant createdAt;

    private Long courseId;
    private String courseTitle;
    private Boolean isHidden;
    private Boolean isPinned;
    private Boolean isReported;
    private String reportReason;
    private Boolean isDeleted;
    private String replyComment;
}
