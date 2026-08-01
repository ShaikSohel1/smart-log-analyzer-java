package com.sohel.loganalyzer.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IpUtils {

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b"
    );

    public static String extractIp(String line) {
        if (line == null || line.trim().isEmpty()) {
            return null;
        }

        Matcher matcher = IPV4_PATTERN.matcher(line);
        if (matcher.find()) {
            return matcher.group();
        }

        // Fallback: splitting logic from legacy implementation if pattern misses custom trailing formats
        String[] parts = line.trim().split("\\s+");
        if (parts.length > 0) {
            String candidate = parts[parts.length - 1];
            if (candidate.matches(".*\\d+\\.\\d+\\.\\d+\\.\\d+.*")) {
                return candidate.replaceAll("[^0-9.]", "");
            }
        }

        return null;
    }

    public static boolean isValidIp(String ip) {
        return ip != null && IPV4_PATTERN.matcher(ip).matches();
    }
}
