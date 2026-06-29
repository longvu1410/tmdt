package org.example.tmdt.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import org.example.tmdt.entity.TeacherWithdrawalRequest;
import org.example.tmdt.enums.WithdrawalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TeacherWithdrawalRequestRepository extends JpaRepository<TeacherWithdrawalRequest, Long> {

    List<TeacherWithdrawalRequest> findByTeacher_IdOrderByCreatedAtDesc(Long teacherId);

    List<TeacherWithdrawalRequest> findAllByOrderByCreatedAtDesc();

    @Query("""
            select coalesce(sum(w.amount), 0)
            from TeacherWithdrawalRequest w
            where w.teacher.id = :teacherId
              and w.year = :year
              and w.quarter = :quarter
              and w.status in :statuses
            """)
    BigDecimal sumAmountByTeacherAndPeriodAndStatuses(
            Long teacherId,
            Integer year,
            Integer quarter,
            Collection<WithdrawalStatus> statuses);

    @Query("""
            select coalesce(sum(w.amount), 0)
            from TeacherWithdrawalRequest w
            where w.teacher.id = :teacherId
              and w.status in :statuses
            """)
    BigDecimal sumAmountByTeacherAndStatuses(
            Long teacherId,
            Collection<WithdrawalStatus> statuses);

    @Query("""
            select coalesce(sum(w.amount), 0)
            from TeacherWithdrawalRequest w
            where w.teacher.id = :teacherId
              and w.year <= :year
              and w.status in :statuses
            """)
    BigDecimal sumAmountByTeacherAndYearBeforeAndStatuses(
            Long teacherId,
            Integer year,
            Collection<WithdrawalStatus> statuses);
}
