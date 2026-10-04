package com.sohel.loganalyzer.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogReportSummaryDto {
    private Long id;
    private String fileName;
    private int totalLogs;
    private int errorCount;
    private int failedLogins;
    private int suspiciousIpCount;
    private String overallStatus;
    private LocalDateTime createdAt;
}
