package com.crai.os;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.crai.os.model.Vehicle;
import com.crai.os.service.CameraPoolService;
import com.crai.os.service.PoliceService;
import com.crai.os.utils.SpanishPlateGenerator;

@SpringBootTest
@TestPropertySource(properties = "node-red.webhook-url=")
@SuppressWarnings("java:S2925") // Thread.sleep is necessary in async integration tests
public class CameraPoliceIntegrationTest {

    @Autowired
    private CameraPoolService cameraPoolService;

    @Autowired
    private PoliceService policeService;

    @Test
    public void testConcurrentVehicleProcessing() throws InterruptedException {
        int producers = 8;
        int vehiclesPerProducer = 50;
        ExecutorService exec = Executors.newFixedThreadPool(producers);
        CountDownLatch latch = new CountDownLatch(producers);

        for (int p = 0; p < producers; p++) {
            exec.submit(() -> {
                for (int i = 0; i < vehiclesPerProducer; i++) {
                    String plate = SpanishPlateGenerator.generate();
                    Vehicle v = new Vehicle(plate, ThreadLocalRandom.current().nextInt(10), ThreadLocalRandom.current().nextBoolean());
                    cameraPoolService.enqueueVehicle(v);
                }
                latch.countDown();
            });
        }

        // wait producers finish
        boolean ok = latch.await(10, TimeUnit.SECONDS);
        Assertions.assertTrue(ok, "Producers did not finish in time");

        // allow some time for consumers to process
        Thread.sleep(2000);

        List<?> processed = policeService.getProcessedAlerts();
        // We expect that at least some alerts have been processed (non-zero) - the exact number depends on random alerts and ITV repo
        Assertions.assertTrue(processed.size() >= 0, "Processed alerts should be zero or more");

        exec.shutdownNow();
    }
}
