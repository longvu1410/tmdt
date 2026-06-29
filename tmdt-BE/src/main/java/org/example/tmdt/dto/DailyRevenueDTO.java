package org.example.tmdt.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueDTO {

    private LocalDate date;
    private BigDecimal revenue;
    private Long orderCount;
}
