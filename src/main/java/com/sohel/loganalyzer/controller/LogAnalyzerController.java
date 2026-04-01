package com.sohel.loganalyzer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sohel.loganalyzer.model.LogAnalysisResult;
import com.sohel.loganalyzer.service.LogAnalyzerService;

@RestController
@RequestMapping("/api/logs")
public class LogAnalyzerController {

    @Autowired
    private LogAnalyzerService service;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
public LogAnalysisResult analyzeLog(@RequestParam("file") MultipartFile file) throws Exception {
    return service.analyze(file.getInputStream());
}
}