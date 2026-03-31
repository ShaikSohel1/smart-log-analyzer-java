import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        String filePath = "sample.log";

        try {
            LogParser parser = new LogParser();
            Report report = parser.parse(filePath);

            ReportGenerator generator = new ReportGenerator();
            generator.generate(report);

        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }
}