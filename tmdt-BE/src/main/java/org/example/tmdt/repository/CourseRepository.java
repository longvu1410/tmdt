package org.example.tmdt.repository;

import java.util.List;
import java.util.Optional;
import org.example.tmdt.entity.Course;
import org.example.tmdt.enums.CourseStatus;
import org.example.tmdt.enums.CourseTopic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsBySlug(String slug);

    Optional<Course> findBySlug(String slug);

    List<Course> findByActiveTrueAndStatusOrderByCreatedAtDesc(CourseStatus status);

    List<Course> findByActiveTrueAndStatusAndTopicOrderByCreatedAtDesc(CourseStatus status, CourseTopic topic);

    List<Course> findByStatusOrderByCreatedAtDesc(CourseStatus status);

    Optional<Course> findByIdAndActiveTrueAndStatus(Long id, CourseStatus status);

    Optional<Course> findBySlugAndActiveTrueAndStatus(String slug, CourseStatus status);

    List<Course> findByTeacher_IdOrderByCreatedAtDesc(Long teacherId);
}
