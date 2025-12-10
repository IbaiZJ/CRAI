package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class DebugControllerTest {

    private final DebugController controller = new DebugController();

    @Test
    void threadsReturnsThreadMetadata() {
        List<Map<String, Object>> threads = controller.threads();

        assertFalse(threads.isEmpty(), "Thread list should not be empty");
        for (Map<String, Object> info : threads) {
            assertTrue(info.containsKey("id"));
            assertTrue(info.containsKey("name"));
            assertTrue(info.containsKey("state"));
            assertTrue(info.containsKey("daemon"));
            assertTrue(info.containsKey("priority"));
            assertTrue(info.containsKey("stackDepth"));
            assertNotNull(info.get("id"));
            assertNotNull(info.get("name"));
            assertNotNull(info.get("state"));
            assertNotNull(info.get("daemon"));
            assertNotNull(info.get("priority"));
            assertNotNull(info.get("stackDepth"));
        }
    }
}
