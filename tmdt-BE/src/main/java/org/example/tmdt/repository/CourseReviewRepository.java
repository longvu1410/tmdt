package org.example.tmdt.repository;

import org.example.tmdt.entity.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    @Query("""
           select r from CourseReview r
           where r.course.teacher.id = :teacherId
             and r.isDeleted = false
           order by r.createdAt desc
           """)
    List<CourseReview> findTeacherReviews(@Param("teacherId") Long teacherId);

    @Query("""
           select r from CourseReview r
           order by r.createdAt desc
           """)
    List<CourseReview> findAllReviews();
}
