package org.example.tmdt.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {

    @NotBlank
    @Size(max = 160)
    private String slug;

    @NotBlank
    @Size(max = 180)
    private String title;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @Size(max = 500)
    private String thumbnailUrl;

    @NotBlank
    @Size(max = 100)
    private String instructorName;

    @NotBlank
    @Size(max = 40)
    private String language;

    @NotBlank
    @Size(max = 40)
    private String level;

    @Size(max = 40)
    private String topic;

    @NotNull
    @Min(0)
    private Integer studentCount;

    @NotNull
    @Min(1)
    private Integer lessonCount;

    @NotBlank
    @Size(max = 40)
    private String totalDuration;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("5.00")
    private BigDecimal rating;

    @NotNull
    @Min(0)
    private Integer ratingCount;

    /** Giá sau giảm, null = không khuyến mãi */
    @DecimalMin("0.00")
    private BigDecimal discountPrice;

    /** Thời điểm bắt đầu giảm giá (null = ngay lập tức) */
    private Instant discountStartAt;

    /** Thời điểm kết thúc giảm giá (null = vô thời hạn) */
    private Instant discountEndAt;

    @Size(max = 20)
    private List<@NotBlank @Size(max = 250) String> outcomes = new ArrayList<>();

    @Size(max = 20)
    private List<@NotBlank @Size(max = 250) String> benefits = new ArrayList<>();

    @Valid
    @Size(max = 30)
    private List<CourseSectionRequest> sections = new ArrayList<>();

    @Valid
    @Size(max = 20)
    private List<CourseReviewRequest> reviews = new ArrayList<>();

    private Boolean active = true;
}
