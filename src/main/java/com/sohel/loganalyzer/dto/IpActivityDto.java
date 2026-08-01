package com.sohel.loganalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IpActivityDto {
    private String ipAddress;
    private int attemptCount;
    private String riskLevel;
    private String recommendation;
}
