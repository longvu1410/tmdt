package org.example.tmdt.repository;

import java.util.List;
import org.example.tmdt.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.courseId = :courseId
          AND ((m.senderId = :userId1 AND m.receiverId = :userId2)
               OR (m.senderId = :userId2 AND m.receiverId = :userId1))
        ORDER BY m.timestamp ASC
    """)
    List<ChatMessage> findChatHistory(
        @Param("courseId") Long courseId,
        @Param("userId1") Long userId1,
        @Param("userId2") Long userId2
    );

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    long countBySenderIdAndReceiverIdAndCourseIdAndIsReadFalse(Long senderId, Long receiverId, Long courseId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE ChatMessage m
        SET m.isRead = true
        WHERE m.senderId = :senderId
          AND m.receiverId = :receiverId
          AND m.courseId = :courseId
          AND m.isRead = false
    """)
    void markAsRead(
        @Param("senderId") Long senderId,
        @Param("receiverId") Long receiverId,
        @Param("courseId") Long courseId
    );
}
