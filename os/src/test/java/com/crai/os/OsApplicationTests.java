package com.crai.os;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class OsApplicationTests {

	@Test
	void contextLoads() {
		// context bootstraps via @SpringBootTest
	}

	@Test
	void mainStartsAndStoresContext() {
		String[] args = { "--spring.main.web-application-type=none", "--server.port=0", "--spring.main.banner-mode=off" };
		try {
			OsApplication.main(args);
			assertNotNull(OsApplication.getContext());
			assertTrue(OsApplication.getContext().isActive());
		} finally {
			OsApplication.stop();
		}
	}

}
