package com.sohel.loganalyzer.service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sohel.loganalyzer.dto.IpActivityDto;
import com.sohel.loganalyzer.dto.LogAnalysisResponseDto;
import com.sohel.loganalyzer.dto.LogReportSummaryDto;
import com.sohel.loganalyzer.exception.LogProcessingException;
import com.sohel.loganalyzer.exception.ResourceNotFoundException;
import com.sohel.loganalyzer.model.LogAnalysisResult;
import com.sohel.loganalyzer.model.LogReport;
import com.sohel.loganalyzer.repository.LogReportRepository;
import com.sohel.loganalyzer.service.impl.StandardLogParserServiceImpl;
import com.sohel.loganalyzer.validation.LogFileValidator;

@Service
public class LogAnalyzerService {

    private static final Logger log = LoggerFactory.getLogger(LogAnalyzerService.class);

    private final LogParserService parserService;
    private final IpRiskEvaluatorService riskEvaluatorService;
    private final LogFileValidator validator;
    private final LogReportRepository reportRepository;

    @Autowired
    public LogAnalyzerService(
            LogParserService parserService,
            IpRiskEvaluatorService riskEvaluatorService,
            LogFileValidator validator,
            LogReportRepository reportRepository) {
        this.parserService = parserService;
        this.riskEvaluatorService = riskEvaluatorService;
        this.validator = validator;
        this.reportRepository = reportRepository;
    }

    /**
     * Backward-compatible analyze method.
     */
    public LogAnalysisResult analyze(InputStream inputStream) {
        log.info("Executing backward-compatible analyze method");
        return parserService.parse(inputStream);
    }

    /**
     * Full enterprise file analysis workflow.
     */
    public LogAnalysisResponseDto analyzeFile(MultipartFile file) {
        validator.validate(file);

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_log.log";
        long fileSize = file.getSize();
        log.info("Starting log analysis for file: '{}', size: {} bytes", fileName, fileSize);

        LogAnalysisResult result;
        try {
            result = parserService.parse(file.getInputStream());
        } catch (Exception e) {
            log.error("Failed to read input stream from file: {}", fileName, e);
            throw new LogProcessingException("Could not read file input stream: " + e.getMessage(), e);
        }

        List<IpActivityDto> ipActivities = riskEvaluatorService.evaluateAll(result.getSuspiciousIPs());
        int suspiciousCount = result.getSuspiciousIPs() != null ? result.getSuspiciousIPs().size() : 0;
        String overallStatus = riskEvaluatorService.determineOverallStatus(
                result.getErrors(), result.getFailedLogins(), suspiciousCount);

        LogReport savedEntity = reportRepository.save(LogReport.builder()
                .fileName(fileName)
                .fileSize(fileSize)
                .totalLogs(result.getTotalLogs())
                .errorCount(result.getErrors())
                .failedLogins(result.getFailedLogins())
                .suspiciousIpCount(suspiciousCount)
                .overallStatus(overallStatus)
                .createdAt(LocalDateTime.now())
                .build());

        log.info("Successfully analyzed file '{}'. Report ID: {}, Total Logs: {}, Errors: {}, Suspicious IPs: {}",
                fileName, savedEntity.getId(), result.getTotalLogs(), result.getErrors(), suspiciousCount);

        return LogAnalysisResponseDto.builder()
                .id(savedEntity.getId())
                .fileName(fileName)
                .fileSize(fileSize)
                .totalLogs(result.getTotalLogs())
                .errors(result.getErrors())
                .errorCount(result.getErrors())
                .failedLogins(result.getFailedLogins())
                .suspiciousIpCount(suspiciousCount)
                .suspiciousIPs(result.getSuspiciousIPs())
                .ipActivities(ipActivities)
                .overallStatus(overallStatus)
                .processedAt(savedEntity.getCreatedAt())
                .build();
    }

    public List<LogReportSummaryDto> getRecentReports() {
        return reportRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(r -> LogReportSummaryDto.builder()
                        .id(r.getId())
                        .fileName(r.getFileName())
                        .totalLogs(r.getTotalLogs())
                        .errorCount(r.getErrorCount())
                        .failedLogins(r.getFailedLogins())
                        .suspiciousIpCount(r.getSuspiciousIpCount())
                        .overallStatus(r.getOverallStatus())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public LogReport getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log analysis report not found with id: " + id));
    }
}