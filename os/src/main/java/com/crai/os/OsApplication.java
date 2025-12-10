package com.crai.os;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
@EnableScheduling
public class OsApplication {

	private static ConfigurableApplicationContext context;

	public static void main(String[] args) {
		context = SpringApplication.run(OsApplication.class, args);
	}

	// package-private helpers for tests
	static ConfigurableApplicationContext start(String[] args) {
		context = SpringApplication.run(OsApplication.class, args);
		return context;
	}

	static ConfigurableApplicationContext getContext() {
		return context;
	}

	static void stop() {
		if (context != null && context.isActive()) {
			context.close();
		}
	}

}
