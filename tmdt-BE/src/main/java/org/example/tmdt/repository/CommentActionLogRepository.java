package org.example.tmdt.repository;

import java.util.List;
import org.example.tmdt.entity.CommentActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentActionLogRepository extends JpaRepository<CommentActionLog, Long> {

    List<CommentActionLog> findAllByOrderByCreatedAtDesc();

    List<CommentActionLog> findByActor_IdOrderByCreatedAtDesc(Long actorId);
}
