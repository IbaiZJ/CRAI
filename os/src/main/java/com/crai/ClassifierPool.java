package com.crai;

import java.util.concurrent.*;
import java.util.Random;

public class ClassifierPool {

    private final ExecutorService executor;
    private final BlockingQueue<String> inputQueue;
    private final Random random = new Random();
    private int allowed = 0;
    private int denied = 0;
    private int processed = 0;
    private long totalTime = 0;
    private int peak = 0;

    public ClassifierPool(int workers, BlockingQueue<String> inputQueue) {
        this.inputQueue = inputQueue;
        this.executor = Executors.newFixedThreadPool(workers);

        for (int i = 0; i < workers; i++) {
            executor.submit(this::worker);
        }
    }

    private void worker() {
        while (true) {
            try {
                String plate = inputQueue.take();

                long start = System.currentTimeMillis();

                Thread.sleep(150 + random.nextInt(200));

                String[] labels = {"0", "B", "C", "ECO"};
                String label = labels[random.nextInt(labels.length)];

                boolean isAllowed = label.equals("C") || label.equals("ECO");

                if (isAllowed) allowed++;
                else denied++;

                processed++;
                totalTime += (System.currentTimeMillis() - start);
                peak = Math.max(peak, inputQueue.size());

                System.out.println("✔ " + plate + " → " + label + " → " +
                        (isAllowed ? "ALLOWED" : "DENIED"));

            } catch (InterruptedException e) {
                break;
            }
        }
    }

    public SimulationResult getResult() {
        long avg = processed == 0 ? 0 : totalTime / processed;
        return new SimulationResult(processed, allowed, denied, avg, peak);
    }
}
