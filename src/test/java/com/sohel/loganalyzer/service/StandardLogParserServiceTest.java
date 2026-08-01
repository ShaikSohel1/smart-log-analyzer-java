package com.sohel.loganalyzer.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.sohel.loganalyzer.model.LogAnalysisResult;
import com.sohel.loganalyzer.service.impl.StandardLogParserServiceImpl;

import static org.junit.jupiter.api.Assertions.*;

class StandardLogParserServiceTest {

    private LogParserService parserService;

    @BeforeEach
    void setUp() {
        parserService = new StandardLogParserServiceImpl();
    }

    @Test
    @DisplayName("Should correctly parse log lines and identify suspicious IPs (>5 failed attempts)")
    void testParseLogStream() {
        String logData = """
                INFO User logged in
                ERROR Database connection failed
                Failed password from 192.168.1.10
                Failed password from 192.168.1.10
                Failed password from 192.168.1.10
                Failed password from 192.168.1.10
                Failed password from 192.168.1.10
                Failed password from 192.168.1.10
                Failed password from 10.0.0.5
                ERROR Service unavailable
                """;

        InputStream inputStream = new ByteArrayInputStream(logData.getBytes(StandardCharsets.UTF_8));
        LogAnalysisResult result = parserService.parse(inputStream);

        assertEquals(10, result.getTotalLogs());
        assertEquals(2, result.getErrors());
        assertEquals(7, result.getFailedLogins());
        assertEquals(1, result.getSuspiciousIPs().size());
        assertEquals(6, result.getSuspiciousIPs().get("192.168.1.10"));
        assertNull(result.getSuspiciousIPs().get("10.0.0.5")); // 1 attempt is not > 5
    }
}
