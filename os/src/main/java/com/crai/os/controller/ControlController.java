package com.crai.os.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crai.os.config.SimulationConfig;
import com.crai.os.service.CameraPoolService;

@RestController
@RequestMapping("/admin")
public class ControlController {

    private final SimulationConfig config;
    private final CameraPoolService cameraPoolService;

    public ControlController(SimulationConfig config, CameraPoolService cameraPoolService) {
        this.config = config;
        this.cameraPoolService = cameraPoolService;
    }

    @PostMapping("/ocr-delay")
    public String setDelay(@RequestParam int ms) {
        config.setOcrDelayMs(ms);
        return "OCR delay updated to " + ms + " ms";
    }

    @PostMapping("/steal-prob")
    public String setStealProb(@RequestParam double prob) {
        config.setStolenProbability(prob);
        return "Stolen probability updated to " + prob;
    }

    @PostMapping("/itv-prob")
    public String setItvProb(@RequestParam double prob) {
        config.setItvFailProbability(prob);
        return "ITV fail probability updated to " + prob;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "ocrDelayMs", config.getOcrDelayMs(),
                "stolenProbability", config.getStolenProbability(),
                "itvFailProbability", config.getItvFailProbability(),
                "cameraCount", config.getCameraCount());
    }

    @PostMapping("/cameras")
    public String updateCameras(@RequestParam int count) {
        config.setCameraCount(count);
        cameraPoolService.resizeCameraPool(count);
        return " Camera count updated to " + count;
    }

    @PostMapping("/vehicles-per-cycle")
    public String setVehiclesPerCycle(@RequestParam int n) {
        config.setVehiclesPerCycle(n);
        return " Vehicles per cycle updated to " + n;
    }

    @PostMapping("/vehicle-interval")
    public String setInterval(@RequestParam int ms) {
        config.setVehicleIntervalMs(ms);
        return " Vehicle generator interval updated to " + ms + " ms";
    }

    @PostMapping("/update")
    public Map<String, Object> updateSim(@RequestBody Map<String, Object> params) {

        Map<String, Object> updated = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        if (params.containsKey("cameraCount")) {
            Integer c = toInt(params.get("cameraCount"));
            if (c == null || c <= 0) {
                errors.put("cameraCount", "Must be a positive integer");
            } else {
                config.setCameraCount(c);
                cameraPoolService.resizeCameraPool(c);
                updated.put("cameraCount", c);
            }
        }

        if (params.containsKey("stolenProbability")) {
            Double p = toDouble(params.get("stolenProbability"));
            if (p == null || p < 0 || p > 1) {
                errors.put("stolenProbability", "Must be a number between 0 and 1");
            } else {
                config.setStolenProbability(p);
                updated.put("stolenProbability", p);
            }
        }

        if (params.containsKey("itvFailProbability")) {
            Double p = toDouble(params.get("itvFailProbability"));
            if (p == null || p < 0 || p > 1) {
                errors.put("itvFailProbability", "Must be a number between 0 and 1");
            } else {
                config.setItvFailProbability(p);
                updated.put("itvFailProbability", p);
            }
        }

        if (params.containsKey("ocrDelayMs")) {
            Integer ms = toInt(params.get("ocrDelayMs"));
            if (ms == null || ms < 0) {
                errors.put("ocrDelayMs", "Must be a non-negative integer (ms)");
            } else {
                config.setOcrDelayMs(ms);
                updated.put("ocrDelayMs", ms);
            }
        }

        if (params.containsKey("vehiclesPerCycle")) {
            Integer n = toInt(params.get("vehiclesPerCycle"));
            if (n == null || n <= 0) {
                errors.put("vehiclesPerCycle", "Must be a positive integer");
            } else {
                config.setVehiclesPerCycle(n);
                updated.put("vehiclesPerCycle", n);
            }
        }

        if (params.containsKey("vehicleIntervalMs")) {
            Integer ms = toInt(params.get("vehicleIntervalMs"));
            if (ms == null || ms < 0) {
                errors.put("vehicleIntervalMs", "Must be a non-negative integer (ms)");
            } else {
                config.setVehicleIntervalMs(ms);
                updated.put("vehicleIntervalMs", ms);
            }
        }

        return Map.of(
                "status", errors.isEmpty() ? "OK" : "PARTIAL",
                "updated", updated,
                "errors", errors);
    }

    private Integer toInt(Object value) {
        if (value instanceof Number n) {
            return n.intValue();
        }
        if (value instanceof String s) {
            try {
                return Integer.parseInt(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Double toDouble(Object value) {
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        if (value instanceof String s) {
            try {
                return Double.parseDouble(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

}
