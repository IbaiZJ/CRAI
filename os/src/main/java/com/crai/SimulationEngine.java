package com.crai;

import org.json.JSONObject;

public class SimulationEngine {

    public String runSimulation() {
        SimulationManager manager = new SimulationManager();
        SimulationResult result = manager.execute();

        JSONObject json = new JSONObject();
        json.put("processed", result.getProcessed());
        json.put("allowed", result.getAllowed());
        json.put("denied", result.getDenied());
        json.put("avgTimeMs", result.getAvgTime());
        json.put("peakQueueSize", result.getPeakQueue());

        return json.toString(2);
    }
}
