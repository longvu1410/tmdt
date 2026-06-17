package org.example.tmdt.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProcessWithdrawalRequest {

    @Size(max = 500)
    private String adminNote;
}
