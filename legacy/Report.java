import java.util.HashMap;

public class Report {
    int totalLogs;
    int errorCount;
    int failedLogins;
    HashMap<String, Integer> ipMap;

    public Report(int totalLogs, int errorCount, int failedLogins, HashMap<String, Integer> ipMap) {
        this.totalLogs = totalLogs;
        this.errorCount = errorCount;
        this.failedLogins = failedLogins;
        this.ipMap = ipMap;
    }
}