package com.crai;

import com.crai.PoliceAlert;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class SimulationEngine {

    private static final List<PoliceAlert> alerts = new CopyOnWriteArrayList<>();

    // Node-RED leerá esto mediante /alerts
    public static JSONArray getAlertsJson() {
        JSONArray arr = new JSONArray();
        for (PoliceAlert alert : alerts) {
            arr.put(alert.toJson());
        }
        return arr;
    }

    // Limpia alertas antes de una nueva simulación (opcional)
    public static void clearAlerts() {
        alerts.clear();
    }

    public String runSimulation(JSONObject input) {

        // Opcional: limpiar alertas previas
        clearAlerts();

        int vehicles = input.optInt("vehicles", 30);
        int cameras = input.optInt("cameras", 2);
        int ocrWorkers = input.optInt("ocrWorkers", 3);
        int classifiers = input.optInt("classifiers", 2);

        SimulationManager manager = new SimulationManager(
                vehicles, cameras, ocrWorkers, classifiers);

        SimulationResult result = manager.execute();

        JSONObject json = new JSONObject();
        json.put("processed", result.getProcessed());
        json.put("allowed", result.getAllowed());
        json.put("denied", result.getDenied());
        json.put("avgTimeMs", result.getAvgTime());
        json.put("peakQueueSize", result.getPeakQueue());
        json.put("policeAlerts", result.getPoliceAlerts());

        return json.toString(2);
    }
}
