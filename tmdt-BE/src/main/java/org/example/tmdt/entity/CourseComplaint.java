package org.example.tmdt.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import org.example.tmdt.enums.ComplaintStatus;

@Entity
@Table(name = "course_complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseComplaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private AppUser student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    /** Loại khiếu nại: CONTENT_QUALITY, MISLEADING, REFUND_REQUEST, TEACHER_BEHAVIOR, OTHER */
    @Column(nullable = false, length = 50)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING;

    /** Phản hồi của Admin */
    @Column(length = 2000)
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_admin_id")
    private AppUser handledByAdmin;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ComplaintStatus.PENDING;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
