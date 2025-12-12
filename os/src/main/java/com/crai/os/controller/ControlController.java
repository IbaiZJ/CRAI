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

    private static final String OCR_DELAY_MS = "ocrDelayMs";
    private static final String STOLEN_PROBABILITY = "stolenProbability";
    private static final String ITV_FAIL_PROBABILITY = "itvFailProbability";
    private static final String CAMERA_COUNT = "cameraCount";
    private static final String VEHICLES_PER_CYCLE = "vehiclesPerCycle";
    private static final String VEHICLE_INTERVAL_MS = "vehicleIntervalMs";

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
                OCR_DELAY_MS, config.getOcrDelayMs(),
                STOLEN_PROBABILITY, config.getStolenProbability(),
                ITV_FAIL_PROBABILITY, config.getItvFailProbability(),
                CAMERA_COUNT, config.getCameraCount());
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

        if (params.containsKey(CAMERA_COUNT)) {
            Integer c = toInt(params.get(CAMERA_COUNT));
            if (c == null || c <= 0) {
                errors.put(CAMERA_COUNT, "Must be a positive integer");
            } else {
                config.setCameraCount(c);
                cameraPoolService.resizeCameraPool(c);
                updated.put(CAMERA_COUNT, c);
            }
        }

        if (params.containsKey(STOLEN_PROBABILITY)) {
            Double p = toDouble(params.get(STOLEN_PROBABILITY));
            if (p == null || p < 0 || p > 1) {
                errors.put(STOLEN_PROBABILITY, "Must be a number between 0 and 1");
            } else {
                config.setStolenProbability(p);
                updated.put(STOLEN_PROBABILITY, p);
            }
        }

        if (params.containsKey(ITV_FAIL_PROBABILITY)) {
            Double p = toDouble(params.get(ITV_FAIL_PROBABILITY));
            if (p == null || p < 0 || p > 1) {
                errors.put(ITV_FAIL_PROBABILITY, "Must be a number between 0 and 1");
            } else {
                config.setItvFailProbability(p);
                updated.put(ITV_FAIL_PROBABILITY, p);
            }
        }

        if (params.containsKey(OCR_DELAY_MS)) {
            Integer ms = toInt(params.get(OCR_DELAY_MS));
            if (ms == null || ms < 0) {
                errors.put(OCR_DELAY_MS, "Must be a non-negative integer (ms)");
            } else {
                config.setOcrDelayMs(ms);
                updated.put(OCR_DELAY_MS, ms);
            }
        }

        if (params.containsKey(VEHICLES_PER_CYCLE)) {
            Integer n = toInt(params.get(VEHICLES_PER_CYCLE));
            if (n == null || n <= 0) {
                errors.put(VEHICLES_PER_CYCLE, "Must be a positive integer");
            } else {
                config.setVehiclesPerCycle(n);
                updated.put(VEHICLES_PER_CYCLE, n);
            }
        }

        if (params.containsKey(VEHICLE_INTERVAL_MS)) {
            Integer ms = toInt(params.get(VEHICLE_INTERVAL_MS));
            if (ms == null || ms < 0) {
                errors.put(VEHICLE_INTERVAL_MS, "Must be a non-negative integer (ms)");
            } else {
                config.setVehicleIntervalMs(ms);
                updated.put(VEHICLE_INTERVAL_MS, ms);
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
