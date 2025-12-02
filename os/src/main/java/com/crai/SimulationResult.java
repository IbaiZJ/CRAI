package com.crai;

public class SimulationResult {

    private int processed;
    private int allowed;
    private int denied;
    private long avgTime;
    private int peakQueue;
    private int policeAlerts;

    public SimulationResult(int processed, int allowed, int denied, long avgTime, int peakQueue, int policeAlerts) {
        this.processed = processed;
        this.allowed = allowed;
        this.denied = denied;
        this.avgTime = avgTime;
        this.peakQueue = peakQueue;
        this.policeAlerts = policeAlerts;
    }

    public int getProcessed() { return processed; }
    public int getAllowed() { return allowed; }
    public int getDenied() { return denied; }
    public long getAvgTime() { return avgTime; }
    public int getPeakQueue() { return peakQueue; }
    public int getPoliceAlerts() { return policeAlerts; }
}
