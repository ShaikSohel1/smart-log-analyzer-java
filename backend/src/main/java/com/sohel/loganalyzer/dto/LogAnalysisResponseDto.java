package com.sohel.loganalyzer.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogAnalysisResponseDto {
    private Long id;
    private String fileName;
    private long fileSize;
    private int totalLogs;
    private int errors;
    private int errorCount;
    private int failedLogins;
    private int suspiciousIpCount;
    private Map<String, Integer> suspiciousIPs;
    private List<IpActivityDto> ipActivities;
    private String overallStatus;
    private LocalDateTime processedAt;
}
