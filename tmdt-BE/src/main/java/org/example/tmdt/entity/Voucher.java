package org.example.tmdt.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.tmdt.enums.VoucherDiscountType;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 180)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherDiscountType discountType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    private Integer usageLimit;

    @Column(nullable = false)
    private Integer usedCount;

    @Column(nullable = false)
    private Boolean active;

    private Instant startsAt;

    private Instant expiresAt;

    /** Teacher sở hữu voucher (null = voucher Admin/global) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private AppUser teacher;

    /** Danh sách ID khóa học được áp dụng (null/empty = tất cả khóa của teacher) */
    @ElementCollection
    @CollectionTable(name = "voucher_applicable_courses", joinColumns = @JoinColumn(name = "voucher_id"))
    @Column(name = "course_id")
    private List<Long> applicableCourseIds;

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
        if (this.usedCount == null) {
            this.usedCount = 0;
        }
        if (this.minOrderAmount == null) {
            this.minOrderAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
