package com.sohel.loganalyzer.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LogAnalyzerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/logs/analyze - should analyze valid log file successfully")
    void testAnalyzeLogEndpointSuccess() throws Exception {
        String content = "INFO System started\nERROR Out of memory\nFailed password from 192.168.1.1\n";
        MockMultipartFile file = new MockMultipartFile(
                "file", "server.log", "text/plain", content.getBytes()
        );

        mockMvc.perform(multipart("/api/logs/analyze").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalLogs").value(3))
                .andExpect(jsonPath("$.data.errors").value(1))
                .andExpect(jsonPath("$.data.failedLogins").value(1));
    }

    @Test
    @DisplayName("GET /api/logs/sample - should analyze sample log endpoint successfully")
    void testSampleLogEndpoint() throws Exception {
        mockMvc.perform(get("/api/logs/sample"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileName").value("sample.log"));
    }

    @Test
    @DisplayName("GET /api/logs/history - should fetch recent history reports list")
    void testHistoryEndpoint() throws Exception {
        mockMvc.perform(get("/api/logs/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/logs/analyze - should return 400 when file is empty")
    void testAnalyzeLogEmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.log", "text/plain", new byte[0]);

        mockMvc.perform(multipart("/api/logs/analyze").file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
