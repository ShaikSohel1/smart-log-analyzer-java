package com.sohel.loganalyzer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI logAnalyzerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Log Analyzer Enterprise API")
                        .description("Production-Ready Security & Operational Log Monitoring RESTful API")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Sohel Shaik")
                                .email("sohel@example.com")
                                .url("https://github.com/ShaikSohel1"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
