package com.crai.os.utils;

import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/**
 * A bounded, blocking priority queue implemented with a monitor (ReentrantLock + Conditions).
 * Blocks on put() when full and on take() when empty. Preserves priority according to natural ordering
 * or a provided comparator.
 */
public class BoundedPriorityBlockingQueue<E> {

    private final PriorityQueue<E> heap;
    private final ReentrantLock lock;
    private final Condition notEmpty;
    private final Condition notFull;
    private final int capacity;

    public BoundedPriorityBlockingQueue(int capacity) {
        this(capacity, null, false);
    }

    public BoundedPriorityBlockingQueue(int capacity, Comparator<? super E> comparator, boolean fair) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be > 0");
        this.capacity = capacity;
        this.heap = (comparator == null) ? new PriorityQueue<>() : new PriorityQueue<>(capacity, comparator);
        this.lock = new ReentrantLock(fair);
        this.notEmpty = lock.newCondition();
        this.notFull = lock.newCondition();
    }

    public void put(E e) throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (heap.size() == capacity) {
                notFull.await();
            }
            heap.offer(e);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public E take() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            while (heap.isEmpty()) {
                notEmpty.await();
            }
            E e = heap.poll();
            notFull.signal();
            return e;
        } finally {
            lock.unlock();
        }
    }

    public int size() {
        lock.lock();
        try {
            return heap.size();
        } finally {
            lock.unlock();
        }
    }
}
