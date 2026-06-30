package org.example.tmdt.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(name = "comment_action_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String actionType; // e.g. HIDE, UNHIDE, PIN, UNPIN, REPORT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private AppUser actor; // The teacher

    @Column(nullable = false)
    private Long commentId;

    @Column(nullable = false, length = 1000)
    private String commentContent;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
