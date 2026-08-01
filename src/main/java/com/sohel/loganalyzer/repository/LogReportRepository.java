package com.sohel.loganalyzer.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sohel.loganalyzer.model.LogReport;

@Repository
public interface LogReportRepository extends JpaRepository<LogReport, Long> {
    List<LogReport> findTop10ByOrderByCreatedAtDesc();
}
