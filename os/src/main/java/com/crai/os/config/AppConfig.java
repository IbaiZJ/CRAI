package com.crai.os.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.crai.os.utils.LoggingUtils;
import com.crai.os.utils.VehicleMapper;

@Configuration
public class AppConfig {

    @Bean
    public LoggingUtils loggingUtils() {
        return new LoggingUtils();
    }

    @Bean
    public VehicleMapper vehicleMapper() {
        return new VehicleMapper();
    }
}
