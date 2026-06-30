package org.example.tmdt.repository;

import java.util.List;
import java.util.Optional;
import org.example.tmdt.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    boolean existsByCode(String code);

    Optional<Voucher> findByCode(String code);

    List<Voucher> findAllByOrderByCreatedAtDesc();

    List<Voucher> findByTeacher_IdOrderByCreatedAtDesc(Long teacherId);

    Optional<Voucher> findByCodeAndActiveTrue(String code);
}
