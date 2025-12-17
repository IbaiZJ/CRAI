package com.crai.os.utils;

import java.util.Comparator;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.fail;
import org.junit.jupiter.api.Test;

@SuppressWarnings("java:S2925") // Thread.sleep is necessary in concurrent queue tests
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

    @Test
    void constructorWithComparatorSortsInReverseOrder() throws InterruptedException {
        Comparator<Integer> reverseComparator = Comparator.reverseOrder();
        BoundedPriorityBlockingQueue<Integer> queue = new BoundedPriorityBlockingQueue<>(10, reverseComparator, false);

        queue.put(1);
        queue.put(5);
        queue.put(3);

        // With reverse order, highest first
        assertThat(queue.take()).isEqualTo(5);
        assertThat(queue.take()).isEqualTo(3);
        assertThat(queue.take()).isEqualTo(1);
    }

    @Test
    void constructorWithFairLockingWorks() throws InterruptedException {
        BoundedPriorityBlockingQueue<Integer> queue = new BoundedPriorityBlockingQueue<>(10, null, true);

        queue.put(2);
        queue.put(1);

        assertThat(queue.take()).isEqualTo(1);
        assertThat(queue.take()).isEqualTo(2);
    }

    @Test
    void constructorThrowsOnInvalidCapacity() {
        assertThatThrownBy(() -> new BoundedPriorityBlockingQueue<Integer>(0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("capacity must be > 0");

        assertThatThrownBy(() -> new BoundedPriorityBlockingQueue<Integer>(-1))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void sizeReturnsCorrectValue() throws InterruptedException {
        BoundedPriorityBlockingQueue<Integer> queue = new BoundedPriorityBlockingQueue<>(10);

        assertThat(queue.size()).isEqualTo(0);

        queue.put(1);
        assertThat(queue.size()).isEqualTo(1);

        queue.put(2);
        assertThat(queue.size()).isEqualTo(2);

        queue.take();
        assertThat(queue.size()).isEqualTo(1);
    }

    @Test
    void takeBlocksWhenEmptyAndResumesAfterPut() throws Exception {
        BoundedPriorityBlockingQueue<String> queue = new BoundedPriorityBlockingQueue<>(10);

        CountDownLatch attempting = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        AtomicReference<Exception> threadError = new AtomicReference<>();

        Thread t = new Thread(() -> {
            try {
                attempting.countDown();
                result.set(queue.take()); // should block until a put happens
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

        // now put to signal
        queue.put("item");

        // wait for thread to finish its take
        assertThat(done.await(1, TimeUnit.SECONDS)).isTrue();
        if (threadError.get() != null) {
            fail("Background take threw", threadError.get());
        }

        assertThat(result.get()).isEqualTo("item");
    }
}
