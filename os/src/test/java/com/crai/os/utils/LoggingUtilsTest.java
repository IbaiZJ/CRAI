package com.crai.os.utils;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LoggingUtilsTest {

    private LoggingUtils loggingUtils;
    private ByteArrayOutputStream outputStream;
    private PrintStream originalOut;

    @BeforeEach
    void setUp() {
        loggingUtils = new LoggingUtils();
        outputStream = new ByteArrayOutputStream();
        originalOut = System.out;
        System.setOut(new PrintStream(outputStream));
    }

    @Test
    void logOutputsMessageToConsole() {
        loggingUtils.log("Test message");

        String output = outputStream.toString();
        assertThat(output).contains("LOG: Test message");

        // Restore original System.out
        System.setOut(originalOut);
    }

    @Test
    void logHandlesEmptyMessage() {
        loggingUtils.log("");

        String output = outputStream.toString();
        assertThat(output).contains("LOG:");

        System.setOut(originalOut);
    }
}
