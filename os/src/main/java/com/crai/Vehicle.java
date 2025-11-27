package com.crai;

public class Vehicle implements Comparable<Vehicle>, Runnable {

    private final int id;
    private final int priority;
    private final CameraPool cameraPool;
    private long startTime;

    public Vehicle(int id, int priority, CameraPool cameraPool) {
        this.id = id;
        this.priority = priority;
        this.cameraPool = cameraPool;
    }

    @Override
    public void run() {
        try {
            Thread.sleep((long)(Math.random() * 1200));
            startTime = System.currentTimeMillis();

            System.out.println("🚗 Vehicle " + id + " (priority " + priority + ") arrives.");
            cameraPool.enqueueVehicle(this);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public int getId() { return id; }
    public int getPriority() { return priority; }
    public long getStartTime() { return startTime; }

    @Override
    public int compareTo(Vehicle other) {
        return Integer.compare(other.priority, this.priority);
    }
}
