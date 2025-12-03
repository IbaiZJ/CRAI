package com.crai.os;

import com.crai.os.model.Vehicle;
import com.crai.os.utils.BoundedPriorityBlockingQueue;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.concurrent.*;
import java.util.concurrent.ThreadLocalRandom;

public class CameraPoolBoundedTest {

    @Test
    public void testQueueIsBoundedBySemaphore() throws Exception {
        int capacity = 5;

        BoundedPriorityBlockingQueue<Vehicle> q = new BoundedPriorityBlockingQueue<>(capacity);

        ExecutorService exec = Executors.newCachedThreadPool();

        // Fill the queue
        java.util.List<Future<?>> futures = new java.util.ArrayList<>();
        for (int i = 0; i < capacity; i++) {
            futures.add(exec.submit(() -> {
                try {
                    q.put(new Vehicle("TST" + ThreadLocalRandom.current().nextInt(10000), 1, false));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
        }

        // Wait briefly for puts to drain into the queue
        for (Future<?> f : futures) {
            try { f.get(500, TimeUnit.MILLISECONDS); } catch (TimeoutException ignored) {}
        }

        // Now a subsequent put should block
        Future<?> blocked = exec.submit(() -> {
            try {
                q.put(new Vehicle("BLOCKER", 1, false));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        try {
            blocked.get(300, TimeUnit.MILLISECONDS);
            Assertions.fail("Expected the enqueue to block but it completed");
        } catch (TimeoutException te) {
            // expected
        } finally {
            exec.shutdownNow();
        }
    }
}
