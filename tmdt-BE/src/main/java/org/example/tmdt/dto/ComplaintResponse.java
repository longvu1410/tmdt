package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;
import org.example.tmdt.enums.ComplaintStatus;

import java.time.Instant;

@Getter
@Builder
public class ComplaintResponse {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private Long studentId;
    private String studentName;
    private String title;
    private String content;
    private String type;
    private String typeName;
    private ComplaintStatus status;
    private String statusName;
    private String adminResponse;
    private String handledByAdminName;
    private Instant createdAt;
    private Instant updatedAt;
}
