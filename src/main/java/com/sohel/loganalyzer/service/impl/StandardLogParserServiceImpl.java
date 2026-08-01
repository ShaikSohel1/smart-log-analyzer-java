package com.sohel.loganalyzer.service.impl;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.sohel.loganalyzer.exception.LogProcessingException;
import com.sohel.loganalyzer.model.LogAnalysisResult;
import com.sohel.loganalyzer.service.LogParserService;
import com.sohel.loganalyzer.util.IpUtils;

@Service
public class StandardLogParserServiceImpl implements LogParserService {

    private static final Logger log = LoggerFactory.getLogger(StandardLogParserServiceImpl.class);
    private static final String FAILED_PASSWORD_KEYWORD = "Failed password";
    private static final String ERROR_KEYWORD = "ERROR";

    @Override
    public LogAnalysisResult parse(InputStream inputStream) {
        if (inputStream == null) {
            throw new LogProcessingException("InputStream cannot be null for log parsing.");
        }

        int totalLogs = 0;
        int errorCount = 0;
        int failedLogins = 0;
        Map<String, Integer> ipMap = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                totalLogs++;

                if (line.contains(ERROR_KEYWORD)) {
                    errorCount++;
                }

                if (line.contains(FAILED_PASSWORD_KEYWORD)) {
                    failedLogins++;
                    String ip = IpUtils.extractIp(line);
                    if (ip != null) {
                        ipMap.put(ip, ipMap.getOrDefault(ip, 0) + 1);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to read log stream: {}", e.getMessage(), e);
            throw new LogProcessingException("Error reading log content stream: " + e.getMessage(), e);
        }

        Map<String, Integer> suspiciousOnly = new HashMap<>();
        for (Map.Entry<String, Integer> entry : ipMap.entrySet()) {
            if (entry.getValue() > 5) {
                suspiciousOnly.put(entry.getKey(), entry.getValue());
            }
        }

        log.debug("Parsed {} log lines: errors={}, failedLogins={}, suspiciousIPs={}",
                totalLogs, errorCount, failedLogins, suspiciousOnly.size());

        return new LogAnalysisResult(totalLogs, errorCount, failedLogins, suspiciousOnly);
    }
}
