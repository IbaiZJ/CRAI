package com.crai.os;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OsApplication {

	public static void main(String[] args) {
		SpringApplication.run(OsApplication.class, args);
	}

}
