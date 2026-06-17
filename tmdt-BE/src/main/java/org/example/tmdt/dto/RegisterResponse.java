package org.example.tmdt.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegisterResponse {

    private String message;
    private UserResponse user;
}

