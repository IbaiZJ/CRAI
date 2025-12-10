package com.crai.os;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class OsApplicationTests {

	@Test
	void contextLoads() {
		// context bootstraps via @SpringBootTest
	}

	@Test
	void mainStartsApplicationContext() {
		System.setProperty("server.port", "0"); // avoid port conflicts when starting the app
		try (var context = SpringApplication.run(OsApplication.class, new String[] {})) {
			assertTrue(context.isActive());
		} finally {
			System.clearProperty("server.port");
		}
	}

}
