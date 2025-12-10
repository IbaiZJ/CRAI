package com.crai.os.utils;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

class BoundedPriorityBlockingQueueTest {

    @Test
    void takesElementsInPriorityOrder() throws InterruptedException {
        BoundedPriorityBlockingQueue<Integer> queue = new BoundedPriorityBlockingQueue<>(10);

        queue.put(5);
        queue.put(1);
        queue.put(3);

        assertThat(queue.take()).isEqualTo(1);
        assertThat(queue.take()).isEqualTo(3);
        assertThat(queue.take()).isEqualTo(5);
    }

    @Test
    void putBlocksWhenFullAndResumesAfterTake() throws Exception {
        BoundedPriorityBlockingQueue<String> queue = new BoundedPriorityBlockingQueue<>(1);
        queue.put("first");

        CountDownLatch attempting = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<Exception> threadError = new AtomicReference<>();

        Thread t = new Thread(() -> {
            try {
                attempting.countDown();
                queue.put("second"); // should block until a take happens
            } catch (Exception e) {
                threadError.set(e);
            } finally {
                done.countDown();
            }
        });
        t.start();

        // ensure thread started and is blocked
        assertThat(attempting.await(500, TimeUnit.MILLISECONDS)).isTrue();
        Thread.sleep(200); // give it time to block
        assertThat(done.getCount()).isEqualTo(1);

        // now take to free space
        assertThat(queue.take()).isEqualTo("first");

        // wait for thread to finish its put
        assertThat(done.await(1, TimeUnit.SECONDS)).isTrue();
        if (threadError.get() != null) {
            fail("Background put threw", threadError.get());
        }

        // verify the second element is present
        assertThat(queue.take()).isEqualTo("second");
    }
}
