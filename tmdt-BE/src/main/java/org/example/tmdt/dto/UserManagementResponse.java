package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class UserManagementResponse {
    private Long id;
    private String username;
    private String email;
    private Boolean enabled;
    private List<String> roles;
    private String displayName;
    private Integer warningCount;
    private Instant createdAt;
}
