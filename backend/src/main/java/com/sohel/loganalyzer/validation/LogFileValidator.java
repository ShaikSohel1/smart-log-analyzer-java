package com.sohel.loganalyzer.validation;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.sohel.loganalyzer.exception.InvalidLogFileException;

@Component
public class LogFileValidator {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidLogFileException("Uploaded log file cannot be null or empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidLogFileException("File size exceeds maximum limit of 10 MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && !originalFilename.trim().isEmpty()) {
            String lower = originalFilename.toLowerCase();
            if (!lower.endsWith(".log") && !lower.endsWith(".txt") && !lower.endsWith(".out")) {
                throw new InvalidLogFileException("Invalid file extension. Allowed extensions are .log, .txt, .out");
            }
        }
    }
}
