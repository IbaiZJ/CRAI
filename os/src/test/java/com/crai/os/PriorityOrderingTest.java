package com.crai.os;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;
import com.crai.os.service.PoliceService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.List;

@SpringBootTest
public class PriorityOrderingTest {

    // For determinism we test the queue implementation directly instead of the full Spring wiring.
    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @Bean
        public SimulationConfig simulationConfig() {
            return new SimulationConfig() {
                @Override
                public int getCameraCount() { return 1; }

                @Override
                public int getCameraQueueCapacity() { return 100; }
            };
        }
    }

    @Autowired
    private CameraPoolService cameraPoolService;

    @Autowired
    private PoliceService policeService;

    private Vehicle make(String plate, int priority) {
        return new Vehicle(plate, priority, true, "C", false); // alertVehicle=true to generate police alert
    }

    private boolean waitForProcessedCount(int expected, long timeoutMs) throws InterruptedException {
        long deadline = Instant.now().toEpochMilli() + timeoutMs;
        while (Instant.now().toEpochMilli() < deadline) {
            List<?> processed = policeService.getProcessedAlerts();
            if (processed.size() >= expected) return true;
            Thread.sleep(50);
        }
        return false;
    }

    @Test
    public void testPriorityProcessedFirst() throws Exception {
        // Use the BoundedPriorityBlockingQueue directly to deterministically verify ordering
        com.crai.os.utils.BoundedPriorityBlockingQueue<Vehicle> q = new com.crai.os.utils.BoundedPriorityBlockingQueue<>(10);
        Vehicle low = make("LOW_PRI", 1);
        Vehicle high = make("HIGH_PRI", 9);

        q.put(low);
        q.put(high);

        Vehicle first = q.take();
        Assertions.assertEquals("HIGH_PRI", first.getPlate(), "High priority vehicle was not returned first by the priority queue");
    }
}
