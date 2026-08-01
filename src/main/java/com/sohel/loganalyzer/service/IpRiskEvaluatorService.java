package com.sohel.loganalyzer.service;

import java.util.List;

import com.sohel.loganalyzer.dto.IpActivityDto;

public interface IpRiskEvaluatorService {
    IpActivityDto evaluateRisk(String ip, int attemptCount);
    List<IpActivityDto> evaluateAll(java.util.Map<String, Integer> suspiciousIpMap);
    String determineOverallStatus(int errorCount, int failedLogins, int suspiciousIpCount);
}
