package com.crai;

import org.json.JSONObject;

public class SimulationEngine {

    public String runSimulation(JSONObject input) {

        int vehicles     = input.optInt("vehicles", 30);
        int cameras      = input.optInt("cameras", 2);
        int ocrWorkers   = input.optInt("ocrWorkers", 3);
        int classifiers  = input.optInt("classifiers", 2);

        SimulationManager manager = new SimulationManager(
                vehicles, cameras, ocrWorkers, classifiers
        );

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
