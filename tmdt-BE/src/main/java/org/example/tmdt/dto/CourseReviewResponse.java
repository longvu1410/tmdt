package org.example.tmdt.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseReviewResponse {

    private String studentName;
    private Long studentId;
    private Integer rating;
    private String comment;
    private Instant createdAt;
}
