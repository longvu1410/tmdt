package org.example.tmdt.repository;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.Instant;
import org.example.tmdt.entity.CourseOrder;
import org.example.tmdt.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CourseOrderRepository extends JpaRepository<CourseOrder, Long> {

    List<CourseOrder> findByStudent_IdOrderByCreatedAtDesc(Long studentId);

    List<CourseOrder> findAllByOrderByCreatedAtDesc();

    Optional<CourseOrder> findFirstByCourse_IdAndStudent_IdAndStatusOrderByCreatedAtDesc(
            Long courseId,
            Long studentId,
            OrderStatus status);

    long countByCourse_Teacher_IdAndStatusAndPaidAtBetween(
            Long teacherId,
            OrderStatus status,
            Instant start,
            Instant end);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from CourseOrder o
            where o.course.teacher.id = :teacherId
              and o.status = :status
              and o.paidAt >= :start
              and o.paidAt < :end
            """)
    BigDecimal sumTotalAmountByTeacherAndStatusAndPaidAtBetween(
            Long teacherId,
            OrderStatus status,
            Instant start,
            Instant end);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from CourseOrder o
            where o.course.teacher.id = :teacherId
              and o.status = :status
              and o.paidAt < :end
            """)
    BigDecimal sumTotalAmountByTeacherAndStatusAndPaidAtBefore(
            Long teacherId,
            OrderStatus status,
            Instant end);

    @Query("""
            select count(distinct o.course.id)
            from CourseOrder o
            where o.course.teacher.id = :teacherId
              and o.status = :status
              and o.paidAt >= :start
              and o.paidAt < :end
            """)
    long countDistinctCoursesByTeacherAndStatusAndPaidAtBetween(
            Long teacherId,
            OrderStatus status,
            Instant start,
            Instant end);

    @Query(value = """
            SELECT CAST(o.paid_at AS DATE) AS day,
                   COALESCE(SUM(o.total_amount), 0) AS revenue,
                   COUNT(*) AS order_count
            FROM course_orders o
            JOIN courses c ON c.id = o.course_id
            WHERE c.teacher_id = :teacherId
              AND o.status = :status
              AND o.paid_at >= :start
              AND o.paid_at < :endDate
            GROUP BY CAST(o.paid_at AS DATE)
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> findDailyRevenueByTeacherAndStatusAndPaidAtBetween(
            Long teacherId,
            String status,
            Instant start,
            Instant endDate);
}
