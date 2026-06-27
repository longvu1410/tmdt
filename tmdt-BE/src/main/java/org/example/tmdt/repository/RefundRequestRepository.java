package org.example.tmdt.repository;

import org.example.tmdt.entity.RefundRequest;
import org.example.tmdt.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {

    List<RefundRequest> findByStudent_IdOrderByCreatedAtDesc(Long studentId);

    List<RefundRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByOrder_IdAndStatusIn(Long orderId, List<RefundStatus> statuses);

    Optional<RefundRequest> findByOrder_IdAndStatus(Long orderId, RefundStatus status);
}
