package org.example.tmdt.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.tmdt.enums.CourseLevel;
import org.example.tmdt.enums.CourseStatus;
import org.example.tmdt.enums.CourseTopic;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(nullable = false, length = 100)
    private String instructorName;

    @Column(nullable = false, length = 40)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CourseLevel level;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private CourseTopic topic;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private CourseStatus status;

    @Column(length = 500)
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private AppUser teacher;

    @Column(nullable = false)
    private Integer studentCount;

    @Column(nullable = false)
    private Integer lessonCount;

    @Column(nullable = false, length = 40)
    private String totalDuration;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(nullable = false)
    private Integer ratingCount;

    /** Giá sau giảm (null = không có khuyến mãi) */
    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    /** Thời điểm bắt đầu giảm giá (null = ngay lập tức) */
    private Instant discountStartAt;

    /** Thời điểm kết thúc giảm giá (null = vô thời hạn) */
    private Instant discountEndAt;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_outcomes", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "outcome", nullable = false, length = 250)
    @OrderColumn(name = "sort_order")
    private List<String> outcomes = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_benefits", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "benefit", nullable = false, length = 250)
    @OrderColumn(name = "sort_order")
    private List<String> benefits = new ArrayList<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "course_sections", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "sort_order")
    private List<CourseSection> sections = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, createdAt DESC")
    private List<CourseReview> reviews = new ArrayList<>();

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.active == null) {
            this.active = true;
        }
        if (this.status == null) {
            this.status = CourseStatus.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
