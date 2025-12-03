package com.crai;

public class SimulationResult {

    private int processed;
    private int allowed;
    private int denied;
    private long avgTime;
    private int peakQueue;

    public SimulationResult(int processed, int allowed, int denied, long avgTime, int peakQueue) {
        this.processed = processed;
        this.allowed = allowed;
        this.denied = denied;
        this.avgTime = avgTime;
        this.peakQueue = peakQueue;
    }

    public int getProcessed() { return processed; }
    public int getAllowed() { return allowed; }
    public int getDenied() { return denied; }
    public long getAvgTime() { return avgTime; }
    public int getPeakQueue() { return peakQueue; }
}
