package com.sohel.loganalyzer.model;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "log_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    private long fileSize;

    private int totalLogs;

    private int errorCount;

    private int failedLogins;

    private int suspiciousIpCount;

    private String overallStatus;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
