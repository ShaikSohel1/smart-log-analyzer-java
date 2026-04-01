package com.sohel.loganalyzer.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.sohel.loganalyzer.model.LogAnalysisResult;

@Service
public class LogAnalyzerService {

    public LogAnalysisResult analyze(InputStream inputStream) throws IOException {

        int totalLogs = 0;
        int errorCount = 0;
        int failedLogins = 0;

        Map<String, Integer> ipMap = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;

            while ((line = br.readLine()) != null) {
                totalLogs++;

                if (line.contains("ERROR")) {
                    errorCount++;
                }

                if (line.contains("Failed password")) {
                    failedLogins++;

                    String ip = extractIP(line);
                    ipMap.put(ip, ipMap.getOrDefault(ip, 0) + 1);
                }
            }
        }

        Map<String, Integer> suspiciousOnly = new HashMap<>();

for (Map.Entry<String, Integer> entry : ipMap.entrySet()) {
    if (entry.getValue() > 5) {
        suspiciousOnly.put(entry.getKey(), entry.getValue());
    }
}

return new LogAnalysisResult(totalLogs, errorCount, failedLogins, suspiciousOnly);
    }

    // 🔥 Clean helper method
    private String extractIP(String line) {
        String[] parts = line.split(" ");
        return parts[parts.length - 1];
    }
}