import java.util.*;

public class ReportGenerator {

    public void generate(Report report) {

        System.out.println("===== LOG ANALYSIS REPORT =====");
        System.out.println("Total Logs: " + report.totalLogs);
        System.out.println("Errors: " + report.errorCount);
        System.out.println("Failed Logins: " + report.failedLogins);

        System.out.println("\nSuspicious IPs (>5 attempts):");

        for (Map.Entry<String, Integer> entry : report.ipMap.entrySet()) {
            if (entry.getValue() > 5) {
                System.out.println(entry.getKey() + " -> " + entry.getValue() + " attempts");
            }
        }
    }
}