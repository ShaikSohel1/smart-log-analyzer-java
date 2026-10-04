package com.sohel.loganalyzer.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IpUtilsTest {

    @Test
    @DisplayName("Should extract IPv4 address from SSH log line")
    void testExtractIpFromSshLog() {
        String line = "Failed password for invalid user admin from 192.168.1.100 port 22 ssh2";
        String extracted = IpUtils.extractIp(line);
        assertEquals("192.168.1.100", extracted);
    }

    @Test
    @DisplayName("Should extract trailing IP from simple log line")
    void testExtractIpSimple() {
        String line = "Failed password from 10.0.0.5";
        String extracted = IpUtils.extractIp(line);
        assertEquals("10.0.0.5", extracted);
    }

    @Test
    @DisplayName("Should return null for line without IP address")
    void testExtractIpNull() {
        String line = "INFO Application started cleanly";
        String extracted = IpUtils.extractIp(line);
        assertNull(extracted);
    }

    @Test
    @DisplayName("Should validate valid IPv4 format")
    void testIsValidIp() {
        assertTrue(IpUtils.isValidIp("192.168.1.1"));
        assertFalse(IpUtils.isValidIp("256.300.1.1"));
        assertFalse(IpUtils.isValidIp("invalid_ip"));
    }
}
