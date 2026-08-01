package com.sohel.loganalyzer.service;

import java.io.InputStream;

import com.sohel.loganalyzer.model.LogAnalysisResult;

public interface LogParserService {
    LogAnalysisResult parse(InputStream inputStream);
}
