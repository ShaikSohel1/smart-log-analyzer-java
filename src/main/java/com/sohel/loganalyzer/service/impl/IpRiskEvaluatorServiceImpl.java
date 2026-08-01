package com.sohel.loganalyzer.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

import com.sohel.loganalyzer.dto.IpActivityDto;
import com.sohel.loganalyzer.service.IpRiskEvaluatorService;

@Service
public class IpRiskEvaluatorServiceImpl implements IpRiskEvaluatorService {

    @Override
    public IpActivityDto evaluateRisk(String ip, int attemptCount) {
        String riskLevel;
        String recommendation;

        if (attemptCount > 15) {
            riskLevel = "CRITICAL";
            recommendation = "Immediately block IP at firewall level and trigger incident response workflow.";
        } else if (attemptCount > 10) {
            riskLevel = "HIGH";
            recommendation = "Block IP address and reset associated user accounts.";
        } else if (attemptCount > 5) {
            riskLevel = "MEDIUM";
            recommendation = "Flag for security monitoring and enforce CAPTCHA / Rate limiting.";
        } else {
            riskLevel = "LOW";
            recommendation = "Normal threshold. Monitor login attempts.";
        }

        return IpActivityDto.builder()
                .ipAddress(ip)
                .attemptCount(attemptCount)
                .riskLevel(riskLevel)
                .recommendation(recommendation)
                .build();
    }

    @Override
    public List<IpActivityDto> evaluateAll(Map<String, Integer> suspiciousIpMap) {
        List<IpActivityDto> list = new ArrayList<>();
        if (suspiciousIpMap == null) {
            return list;
        }

        for (Map.Entry<String, Integer> entry : suspiciousIpMap.entrySet()) {
            list.add(evaluateRisk(entry.getKey(), entry.getValue()));
        }

        list.sort(Comparator.comparingInt(IpActivityDto::getAttemptCount).reversed());
        return list;
    }

    @Override
    public String determineOverallStatus(int errorCount, int failedLogins, int suspiciousIpCount) {
        if (suspiciousIpCount > 3 || failedLogins > 20) {
            return "CRITICAL_ALERT";
        } else if (suspiciousIpCount > 0 || errorCount > 5 || failedLogins > 5) {
            return "ELEVATED_RISK";
        }
        return "NORMAL";
    }
}
