package org.example.tmdt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatContactDTO {
    private Long id;
    private String displayName;
    private String avatarUrl;
    private Long courseId;
    private String courseTitle;
    private String role;
    private Long unreadCount;

    public ChatContactDTO(Long id, String displayName, String avatarUrl, Long courseId, String courseTitle, String role) {
        this.id = id;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.role = role;
        this.unreadCount = 0L;
    }
}
