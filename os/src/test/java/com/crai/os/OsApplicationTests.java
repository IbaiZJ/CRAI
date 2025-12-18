package com.crai.os;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;

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

	@Test
	void startMethodStartsContextAndReturnsIt() {
		String[] args = { "--spring.main.web-application-type=none", "--server.port=0", "--spring.main.banner-mode=off" };
		try {
			ConfigurableApplicationContext ctx = OsApplication.start(args);
			assertNotNull(ctx);
			assertTrue(ctx.isActive());
			assertNotNull(OsApplication.getContext());
		} finally {
			OsApplication.stop();
		}
	}

	@Test
	void stopMethodClosesContext() {
		String[] args = { "--spring.main.web-application-type=none", "--server.port=0", "--spring.main.banner-mode=off" };
		OsApplication.start(args);
		assertTrue(OsApplication.getContext().isActive());
		
		OsApplication.stop();
		assertFalse(OsApplication.getContext().isActive());
	}

	@Test
	void stopMethodHandlesNullContext() {
		// Reset context to null to test the null branch
		OsApplication.resetContext();
		// Calling stop should not throw when context is null
		OsApplication.stop();
	}

	@Test
	void stopMethodHandlesInactiveContext() {
		// Start and close context to make it inactive but not null
		String[] args = { "--spring.main.web-application-type=none", "--server.port=0", "--spring.main.banner-mode=off" };
		OsApplication.start(args);
		OsApplication.getContext().close(); // Close directly, making isActive() = false
		
		assertFalse(OsApplication.getContext().isActive());
		// Calling stop should not throw when context is not null but inactive
		OsApplication.stop();
	}

}
