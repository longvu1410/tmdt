package org.example.tmdt.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseReview {

    @Column(nullable = false, length = 100)
    private String studentName;

    private Long studentId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 700)
    private String comment;

    private Instant createdAt;
}
