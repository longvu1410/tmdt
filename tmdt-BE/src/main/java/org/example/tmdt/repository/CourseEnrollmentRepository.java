package org.example.tmdt.repository;

import java.util.Optional;
import org.example.tmdt.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    boolean existsByCourse_IdAndStudent_Id(Long courseId, Long studentId);

    Optional<CourseEnrollment> findByCourse_IdAndStudent_Id(Long courseId, Long studentId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT new org.example.tmdt.dto.ChatContactDTO(
            t.id, COALESCE(t.displayName, t.username), t.avatarUrl, c.id, c.title, 'TEACHER'
        )
        FROM CourseEnrollment e
        JOIN e.course c
        JOIN c.teacher t
        WHERE e.student.id = :studentId
    """)
    java.util.List<org.example.tmdt.dto.ChatContactDTO> findTeachersByStudentId(@org.springframework.data.repository.query.Param("studentId") Long studentId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT new org.example.tmdt.dto.ChatContactDTO(
            s.id, COALESCE(s.displayName, s.username), s.avatarUrl, c.id, c.title, 'STUDENT'
        )
        FROM CourseEnrollment e
        JOIN e.course c
        JOIN e.student s
        WHERE c.teacher.id = :teacherId
    """)
    java.util.List<org.example.tmdt.dto.ChatContactDTO> findStudentsByTeacherId(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
}
