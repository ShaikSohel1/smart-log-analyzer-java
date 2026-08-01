package com.sohel.loganalyzer.exception;

public class InvalidLogFileException extends RuntimeException {
    public InvalidLogFileException(String message) {
        super(message);
    }
}
