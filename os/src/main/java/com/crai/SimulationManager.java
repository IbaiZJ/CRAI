package com.crai;

import java.util.concurrent.*;

public class SimulationManager {

    private final int vehicles;
    private final int cameras;
    private final int ocrWorkers;
    private final int classifiers;

    public SimulationManager(int vehicles, int cameras, int ocrWorkers, int classifiers) {
        this.vehicles = vehicles;
        this.cameras = cameras;
        this.ocrWorkers = ocrWorkers;
        this.classifiers = classifiers;
    }

    public SimulationResult execute() {

        BlockingQueue<String> ocrQueue = new ArrayBlockingQueue<>(vehicles);
        BlockingQueue<String> classifyQueue = new ArrayBlockingQueue<>(vehicles);

        CameraPool cameraPool = new CameraPool(cameras, ocrQueue);
        OCRPool ocrPool = new OCRPool(ocrWorkers, ocrQueue, classifyQueue);
        ClassifierPool classifierPool = new ClassifierPool(classifiers, classifyQueue);

        ExecutorService vehicleExecutor = Executors.newCachedThreadPool();

        for (int i = 0; i < vehicles; i++) {
            int priority = (i % 10 == 0) ? 2 : 0;
            vehicleExecutor.submit(new Vehicle(i, priority, cameraPool));
        }

        try {
            Thread.sleep(vehicles * 200L);
        } catch (InterruptedException ignored) {}

        vehicleExecutor.shutdownNow();

        return classifierPool.getResult();
    }
}
