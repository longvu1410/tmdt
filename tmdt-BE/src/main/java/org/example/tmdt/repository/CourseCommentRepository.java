package org.example.tmdt.repository;

import java.util.List;
import org.example.tmdt.entity.CourseComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CourseCommentRepository extends JpaRepository<CourseComment, Long> {

    @Query("""
           select c from CourseComment c
           where c.course.id = :courseId
             and c.parent is null
             and c.isHidden = false
             and c.isDeleted = false
           order by c.isPinned desc, c.createdAt desc
           """)
    List<CourseComment> findActiveRootComments(Long courseId);

    @Query("""
           select c from CourseComment c
           where c.course.teacher.id = :teacherId
             and c.isDeleted = false
           order by c.createdAt desc
           """)
    List<CourseComment> findTeacherComments(Long teacherId);

    @Query("""
           select c from CourseComment c
           order by c.createdAt desc
           """)
    List<CourseComment> findAllCommentsForAdmin();
}
