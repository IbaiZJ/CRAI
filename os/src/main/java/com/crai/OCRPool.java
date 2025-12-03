package com.crai;

import java.util.concurrent.*;

public class OCRPool {

    private final ExecutorService executor;
    private final BlockingQueue<String> inputQueue;
    private final BlockingQueue<String> classifierQueue;

    public OCRPool(int workerCount, BlockingQueue<String> inputQueue, BlockingQueue<String> classifierQueue) {
        this.inputQueue = inputQueue;
        this.classifierQueue = classifierQueue;
        this.executor = Executors.newFixedThreadPool(workerCount);

        for (int i = 0; i < workerCount; i++) {
            executor.submit(this::ocrWorker);
        }
    }

    private void ocrWorker() {
        while (true) {
            try {
                String plate = inputQueue.take();
                System.out.println("🔍 OCR processing: " + plate);

                Thread.sleep(500 + (int)(Math.random() * 300));

                classifierQueue.put(plate);

            } catch (InterruptedException e) {
                break;
            }
        }
    }
}
