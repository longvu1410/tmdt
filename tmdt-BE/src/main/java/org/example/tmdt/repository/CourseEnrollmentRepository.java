package org.example.tmdt.repository;

import java.util.Optional;
import org.example.tmdt.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    boolean existsByCourse_IdAndStudent_Id(Long courseId, Long studentId);

    Optional<CourseEnrollment> findByCourse_IdAndStudent_Id(Long courseId, Long studentId);
}
