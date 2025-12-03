package com.crai;

import java.util.concurrent.*;

public class CameraPool {

    private final ExecutorService executor;
    private final PriorityBlockingQueue<Vehicle> queue = new PriorityBlockingQueue<>();
    private final BlockingQueue<String> ocrQueue;

    public CameraPool(int cameraCount, BlockingQueue<String> ocrQueue) {
        this.ocrQueue = ocrQueue;
        this.executor = Executors.newFixedThreadPool(cameraCount);

        for (int i = 0; i < cameraCount; i++) {
            executor.submit(this::cameraWorker);
        }
    }

    public void enqueueVehicle(Vehicle v) {
        queue.add(v);
    }

    private void cameraWorker() {
        while (true) {
            try {
                Vehicle v = queue.take();
                System.out.println("📸 Camera capturing vehicle " + v.getId());

                Thread.sleep(250 + (int)(Math.random() * 300));
                String plate = "ABC" + String.format("%03d", v.getId());

                ocrQueue.put(plate);

            } catch (InterruptedException e) {
                break;
            }
        }
    }
}
