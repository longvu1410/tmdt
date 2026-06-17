package org.example.tmdt.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseEnrollmentResponse {

    private Long id;
    private Long courseId;
    private String courseSlug;
    private Long studentId;
    private Instant purchasedAt;
}
