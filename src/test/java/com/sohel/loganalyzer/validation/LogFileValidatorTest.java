package com.sohel.loganalyzer.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.sohel.loganalyzer.exception.InvalidLogFileException;

import static org.junit.jupiter.api.Assertions.*;

class LogFileValidatorTest {

    private LogFileValidator validator;

    @BeforeEach
    void setUp() {
        validator = new LogFileValidator();
    }

    @Test
    @DisplayName("Should throw exception when file is null or empty")
    void testValidateEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.log", "text/plain", new byte[0]);
        assertThrows(InvalidLogFileException.class, () -> validator.validate(emptyFile));
    }

    @Test
    @DisplayName("Should throw exception for unsupported file extension")
    void testValidateUnsupportedExtension() {
        MockMultipartFile invalidExt = new MockMultipartFile("file", "test.exe", "application/octet-stream", "content".getBytes());
        assertThrows(InvalidLogFileException.class, () -> validator.validate(invalidExt));
    }

    @Test
    @DisplayName("Should pass validation for valid .log file")
    void testValidateSuccess() {
        MockMultipartFile validFile = new MockMultipartFile("file", "app.log", "text/plain", "INFO Log content".getBytes());
        assertDoesNotThrow(() -> validator.validate(validFile));
    }
}
