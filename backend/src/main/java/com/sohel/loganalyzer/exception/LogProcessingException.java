package com.sohel.loganalyzer.exception;

public class LogProcessingException extends RuntimeException {
    public LogProcessingException(String message) {
        super(message);
    }

    public LogProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
