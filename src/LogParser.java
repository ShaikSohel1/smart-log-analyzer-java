import java.io.*;
import java.util.*;

public class LogParser {

    public Report parse(String filePath) throws IOException {

        BufferedReader br = new BufferedReader(new FileReader(filePath));
        String line;

        int totalLogs = 0;
        int errorCount = 0;
        int failedLogins = 0;

        HashMap<String, Integer> ipMap = new HashMap<>();

        while ((line = br.readLine()) != null) {
            totalLogs++;

            if (line.contains("ERROR")) {
                errorCount++;
            }

            if (line.contains("Failed password")) {
                failedLogins++;

                String[] parts = line.split(" ");
                String ip = parts[parts.length - 1];

                ipMap.put(ip, ipMap.getOrDefault(ip, 0) + 1);
            }
        }

        br.close();

        return new Report(totalLogs, errorCount, failedLogins, ipMap);
    }
}