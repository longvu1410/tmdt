package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseResponse {

    private Long id;
    private String slug;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Instant discountStartAt;
    private Instant discountEndAt;
    private Boolean isDiscountActive;

    private String thumbnailUrl;
    private String instructorName;
    private String language;
    private String level;
    private String topic;
    private String topicName;
    private String topicIcon;
    private String status;
    private String rejectionReason;
    private Long teacherId;
    private String teacherName;
    private Integer studentCount;
    private Integer lessonCount;
    private String totalDuration;
    private BigDecimal rating;
    private Integer ratingCount;
    private Boolean purchased;
    private Boolean reviewed;
    private List<String> outcomes;
    private List<String> benefits;
    private List<CourseSectionResponse> sections;
    private List<CourseReviewResponse> reviews;
}
