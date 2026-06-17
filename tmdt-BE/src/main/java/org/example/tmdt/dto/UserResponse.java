package org.example.tmdt.dto;

import java.util.Set;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String name;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Set<String> roles;
}
