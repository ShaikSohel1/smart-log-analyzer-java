package com.sohel.loganalyzer.model;

import java.util.Map;

public class LogAnalysisResult {

    private int totalLogs;
    private int errors;
    private int failedLogins;
    private Map<String, Integer> suspiciousIPs;

    public LogAnalysisResult(int totalLogs, int errors, int failedLogins, Map<String, Integer> suspiciousIPs) {
        this.totalLogs = totalLogs;
        this.errors = errors;
        this.failedLogins = failedLogins;
        this.suspiciousIPs = suspiciousIPs;
    }

    public int getTotalLogs() { return totalLogs; }
    public int getErrors() { return errors; }
    public int getFailedLogins() { return failedLogins; }
    public Map<String, Integer> getSuspiciousIPs() { return suspiciousIPs; }
}