package com.crai.os.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.function.IntPredicate;
import java.util.function.IntConsumer;
import java.util.function.DoublePredicate;
import java.util.function.DoubleConsumer;

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

        handleIntParam(params, CAMERA_COUNT, this::isPositive,
                value -> {
                    config.setCameraCount(value);
                    cameraPoolService.resizeCameraPool(value);
                },
                "Must be a positive integer", updated, errors);

        handleDoubleParam(params, STOLEN_PROBABILITY, this::isProbability,
                config::setStolenProbability,
                "Must be a number between 0 and 1", updated, errors);

        handleDoubleParam(params, ITV_FAIL_PROBABILITY, this::isProbability,
                config::setItvFailProbability,
                "Must be a number between 0 and 1", updated, errors);

        handleIntParam(params, OCR_DELAY_MS, this::isNonNegative,
                config::setOcrDelayMs,
                "Must be a non-negative integer (ms)", updated, errors);

        handleIntParam(params, VEHICLES_PER_CYCLE, this::isPositive,
                config::setVehiclesPerCycle,
                "Must be a positive integer", updated, errors);

        handleIntParam(params, VEHICLE_INTERVAL_MS, this::isNonNegative,
                config::setVehicleIntervalMs,
                "Must be a non-negative integer (ms)", updated, errors);

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

    private void handleIntParam(Map<String, Object> params, String key, IntPredicate validator,
            IntConsumer onValid, String errorMessage, Map<String, Object> updated, Map<String, String> errors) {
        if (!params.containsKey(key)) {
            return;
        }

        Integer value = toInt(params.get(key));
        if (value == null || !validator.test(value)) {
            errors.put(key, errorMessage);
            return;
        }

        onValid.accept(value);
        updated.put(key, value);
    }

    private void handleDoubleParam(Map<String, Object> params, String key, DoublePredicate validator,
            DoubleConsumer onValid, String errorMessage, Map<String, Object> updated, Map<String, String> errors) {
        if (!params.containsKey(key)) {
            return;
        }

        Double value = toDouble(params.get(key));
        if (value == null || !validator.test(value)) {
            errors.put(key, errorMessage);
            return;
        }

        onValid.accept(value);
        updated.put(key, value);
    }

    private boolean isPositive(int value) {
        return value > 0;
    }

    private boolean isNonNegative(int value) {
        return value >= 0;
    }

    private boolean isProbability(double value) {
        return value >= 0 && value <= 1;
    }

}
