package com.sohel.loganalyzer.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.sohel.loganalyzer.dto.IpActivityDto;
import com.sohel.loganalyzer.service.impl.IpRiskEvaluatorServiceImpl;

import static org.junit.jupiter.api.Assertions.*;

class IpRiskEvaluatorServiceTest {

    private IpRiskEvaluatorService riskEvaluator;

    @BeforeEach
    void setUp() {
        riskEvaluator = new IpRiskEvaluatorServiceImpl();
    }

    @Test
    @DisplayName("Should categorize risk level CRITICAL for > 15 attempts")
    void testCriticalRisk() {
        IpActivityDto result = riskEvaluator.evaluateRisk("192.168.1.1", 20);
        assertEquals("CRITICAL", result.getRiskLevel());
        assertTrue(result.getRecommendation().contains("Immediately block IP"));
    }

    @Test
    @DisplayName("Should categorize risk level HIGH for > 10 attempts")
    void testHighRisk() {
        IpActivityDto result = riskEvaluator.evaluateRisk("192.168.1.2", 12);
        assertEquals("HIGH", result.getRiskLevel());
    }

    @Test
    @DisplayName("Should categorize risk level MEDIUM for > 5 attempts")
    void testMediumRisk() {
        IpActivityDto result = riskEvaluator.evaluateRisk("192.168.1.3", 6);
        assertEquals("MEDIUM", result.getRiskLevel());
    }

    @Test
    @DisplayName("Should determine overall status correctly")
    void testDetermineOverallStatus() {
        assertEquals("CRITICAL_ALERT", riskEvaluator.determineOverallStatus(10, 25, 4));
        assertEquals("ELEVATED_RISK", riskEvaluator.determineOverallStatus(6, 2, 1));
        assertEquals("NORMAL", riskEvaluator.determineOverallStatus(1, 0, 0));
    }
}
