package com.sohel.loganalyzer.controller;

import java.io.InputStream;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sohel.loganalyzer.dto.ApiResponse;
import com.sohel.loganalyzer.dto.LogAnalysisResponseDto;
import com.sohel.loganalyzer.dto.LogReportSummaryDto;
import com.sohel.loganalyzer.exception.LogProcessingException;
import com.sohel.loganalyzer.model.LogReport;
import com.sohel.loganalyzer.service.LogAnalyzerService;
import com.sohel.loganalyzer.util.ByteArrayMultipartFile;

@RestController
@RequestMapping("/api/logs")
@Tag(name = "Log Analyzer API", description = "Endpoints for analyzing log files, evaluating security risks, and fetching analysis reports.")
public class LogAnalyzerController {

    private final LogAnalyzerService service;

    @Autowired
    public LogAnalyzerController(LogAnalyzerService service) {
        this.service = service;
    }

    @Operation(summary = "Analyze Log File", description = "Upload a log file (.log, .txt) to parse total log entries, errors, failed login attempts, and flag suspicious IP addresses.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully analyzed log file",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or empty log file provided"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "413", description = "File size exceeds 10MB limit"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Server error processing log file")
    })
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LogAnalysisResponseDto>> analyzeLog(
            @Parameter(description = "Log file to analyze", required = true)
            @RequestParam("file") MultipartFile file) {
        LogAnalysisResponseDto response = service.analyzeFile(file);
        return ResponseEntity.ok(ApiResponse.success("Log file analyzed successfully.", response));
    }

    @Operation(summary = "Analyze Built-In Sample Log", description = "Runs analysis on the system's built-in sample log file for instant demonstration.")
    @GetMapping(value = "/sample", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LogAnalysisResponseDto>> analyzeSampleLog() {
        try {
            ClassPathResource sampleResource = new ClassPathResource("sample.log");
            InputStream is;
            if (sampleResource.exists()) {
                is = sampleResource.getInputStream();
            } else {
                java.io.File file = new java.io.File("sample.log");
                if (file.exists()) {
                    is = new java.io.FileInputStream(file);
                } else {
                    throw new LogProcessingException("sample.log not found in classpath or project root.");
                }
            }

            byte[] content = is.readAllBytes();
            is.close();

            MultipartFile mockFile = new ByteArrayMultipartFile("sample.log", "sample.log", "text/plain", content);
            LogAnalysisResponseDto response = service.analyzeFile(mockFile);
            return ResponseEntity.ok(ApiResponse.success("Sample log analyzed successfully.", response));
        } catch (Exception e) {
            throw new LogProcessingException("Failed to analyze sample log file: " + e.getMessage(), e);
        }
    }

    @Operation(summary = "Get Recent Analysis History", description = "Retrieves the 10 most recent log analysis report summaries stored in the database.")
    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<List<LogReportSummaryDto>>> getRecentHistory() {
        List<LogReportSummaryDto> history = service.getRecentReports();
        return ResponseEntity.ok(ApiResponse.success("Fetched recent log analysis history.", history));
    }

    @Operation(summary = "Get Report Details By ID", description = "Fetch complete log report details by database report ID.")
    @GetMapping(value = "/history/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LogReport>> getReportById(@PathVariable("id") Long id) {
        LogReport report = service.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success("Fetched log report details.", report));
    }
}