package com.crai;

import java.util.concurrent.*;

public class SimulationManager {

    public SimulationResult execute() {

        BlockingQueue<String> ocrQueue = new ArrayBlockingQueue<>(50);
        BlockingQueue<String> classifyQueue = new ArrayBlockingQueue<>(50);

        CameraPool cameraPool = new CameraPool(2, ocrQueue);
        OCRPool ocrPool = new OCRPool(3, ocrQueue, classifyQueue);
        ClassifierPool classifierPool = new ClassifierPool(2, classifyQueue);

        ExecutorService vehicleExecutor = Executors.newCachedThreadPool();

        for (int i = 0; i < 30; i++) {
            int priority = (i % 10 == 0) ? 2 : 0;
            vehicleExecutor.submit(new Vehicle(i, priority, cameraPool));
        }

        try { Thread.sleep(6000); } catch (InterruptedException ignored) {}

        vehicleExecutor.shutdownNow();
        return classifierPool.getResult();
    }
}
