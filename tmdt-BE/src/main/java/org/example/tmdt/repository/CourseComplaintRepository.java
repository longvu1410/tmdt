package org.example.tmdt.repository;

import java.util.List;
import org.example.tmdt.entity.CourseComplaint;
import org.example.tmdt.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseComplaintRepository extends JpaRepository<CourseComplaint, Long> {

    List<CourseComplaint> findByStudent_IdOrderByCreatedAtDesc(Long studentId);

    List<CourseComplaint> findByOrderByCreatedAtDesc();

    List<CourseComplaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    boolean existsByStudent_IdAndCourse_Id(Long studentId, Long courseId);

    List<CourseComplaint> findByStudent_IdAndCourse_IdOrderByCreatedAtDesc(Long studentId, Long courseId);
}
