package org.example.tmdt.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherActionLogResponse {
    private Long id;
    private String actionType;
    private Long teacherId;
    private String teacherDisplayName;
    private Long commentId;
    private String commentContent;
    private String reason;
    private Instant createdAt;
}
