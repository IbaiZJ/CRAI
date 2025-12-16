package com.crai.os.controller;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.config.SimulationConfig;
import com.crai.os.service.CameraPoolService;

@ExtendWith(MockitoExtension.class)
class ControlControllerTest {

    @Mock
    private CameraPoolService cameraPoolService;

    private SimulationConfig config;
    private ControlController controller;

    @BeforeEach
    void setUp() {
        config = new SimulationConfig();
        controller = new ControlController(config, cameraPoolService);
    }

    @Test
    void setDelayUpdatesConfig() {
        String response = controller.setDelay(150);

        assertEquals("OCR delay updated to 150 ms", response);
        assertEquals(150, config.getOcrDelayMs());
    }

    @Test
    void setStealProbUpdatesConfig() {
        String response = controller.setStealProb(0.4);

        assertEquals("Stolen probability updated to 0.4", response);
        assertEquals(0.4, config.getStolenProbability());
    }

    @Test
    void setItvProbUpdatesConfig() {
        String response = controller.setItvProb(0.25);

        assertEquals("ITV fail probability updated to 0.25", response);
        assertEquals(0.25, config.getItvFailProbability());
    }

    @Test
    void updateCamerasResizesPool() {
        String response = controller.updateCameras(5);

        assertEquals(" Camera count updated to 5", response);
        assertEquals(5, config.getCameraCount());
        verify(cameraPoolService).resizeCameraPool(5);
    }

    @Test
    void setVehiclesPerCycleUpdatesConfig() {
        String response = controller.setVehiclesPerCycle(3);

        assertEquals(" Vehicles per cycle updated to 3", response);
        assertEquals(3, config.getVehiclesPerCycle());
        verifyNoMoreInteractions(cameraPoolService);
    }

    @Test
    void setIntervalUpdatesConfig() {
        String response = controller.setInterval(750);

        assertEquals(" Vehicle generator interval updated to 750 ms", response);
        assertEquals(750, config.getVehicleIntervalMs());
    }

    @Test
    void statusReturnsCurrentValues() {
        // tweak some values to ensure map reflects current config
        config.setCameraCount(4);
        config.setStolenProbability(0.2);
        config.setItvFailProbability(0.15);
        config.setOcrDelayMs(500);

        Map<String, Object> status = controller.status();

        assertEquals(4, status.get("cameraCount"));
        assertEquals(0.2, status.get("stolenProbability"));
        assertEquals(0.15, status.get("itvFailProbability"));
        assertEquals(500, status.get("ocrDelayMs"));
    }

    @Test
    void updateSimHandlesMixedValidAndInvalidValues() {
        Map<String, Object> params = new HashMap<>();
        params.put("cameraCount", 0); // invalid (<=0)
        params.put("stolenProbability", "abc"); // invalid string
        params.put("itvFailProbability", 0.6); // valid number
        params.put("ocrDelayMs", -5); // invalid negative
        params.put("vehiclesPerCycle", 3); // valid int
        params.put("vehicleIntervalMs", "2500"); // valid string parse

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));

        Map<?, ?> updated = (Map<?, ?>) result.get("updated");
        assertEquals(3, updated.get("vehiclesPerCycle"));
        assertEquals(0.6, updated.get("itvFailProbability"));
        assertEquals(2500, updated.get("vehicleIntervalMs"));

        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("cameraCount"));
        assertTrue(errors.containsKey("stolenProbability"));
        assertTrue(errors.containsKey("ocrDelayMs"));

        // config should only reflect valid updates
        assertEquals(0.6, config.getItvFailProbability());
        assertEquals(3, config.getVehiclesPerCycle());
        assertEquals(2500, config.getVehicleIntervalMs());
        assertEquals(200, config.getOcrDelayMs()); // not updated due to error (default)
        verify(cameraPoolService, never()).resizeCameraPool(0);
    }

    @Test
    void updateSimUpdatesCameraCountAndResizesPool() {
        Map<String, Object> params = Map.of("cameraCount", 6);

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("OK", result.get("status"));
        assertEquals(6, ((Map<?, ?>) result.get("updated")).get("cameraCount"));
        assertEquals(6, config.getCameraCount());
        verify(cameraPoolService).resizeCameraPool(6);
    }

    @Test
    void updateSimReturnsErrorsForUnsupportedTypes() {
        Map<String, Object> params = Map.of(
                "cameraCount", true, // not a number or string
                "stolenProbability", new Object(), // not a number or string
                "vehicleIntervalMs", "oops"); // invalid string -> NumberFormatException path

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("cameraCount"));
        assertTrue(errors.containsKey("stolenProbability"));
        assertTrue(errors.containsKey("vehicleIntervalMs"));
        verify(cameraPoolService, never()).resizeCameraPool(org.mockito.Mockito.anyInt());
    }

    @Test
    void updateSimValidatesItvProbabilityBoundaries() {
        Map<String, Object> params = new HashMap<>();
        params.put("itvFailProbability", 1.5); // > 1, invalid

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("itvFailProbability"));
    }

    @Test
    void updateSimValidatesStolenProbabilityNegative() {
        Map<String, Object> params = new HashMap<>();
        params.put("stolenProbability", -0.5); // < 0, invalid

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("stolenProbability"));
    }

    @Test
    void updateSimParsesIntegerFromString() {
        Map<String, Object> params = new HashMap<>();
        params.put("cameraCount", "10"); // valid integer string
        params.put("ocrDelayMs", "200"); // valid integer string

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("OK", result.get("status"));
        Map<?, ?> updated = (Map<?, ?>) result.get("updated");
        assertEquals(10, updated.get("cameraCount"));
        assertEquals(200, updated.get("ocrDelayMs"));
        verify(cameraPoolService).resizeCameraPool(10);
    }

    @Test
    void updateSimParsesDoubleFromString() {
        Map<String, Object> params = new HashMap<>();
        params.put("stolenProbability", "0.75"); // valid double string

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("OK", result.get("status"));
        Map<?, ?> updated = (Map<?, ?>) result.get("updated");
        assertEquals(0.75, updated.get("stolenProbability"));
    }

    @Test
    void updateSimHandlesInvalidDoubleString() {
        Map<String, Object> params = new HashMap<>();
        params.put("itvFailProbability", "not-a-number");

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("itvFailProbability"));
    }

    // ========= Additional branch coverage tests =========

    @Test
    void updateSimValidatesStolenProbabilityGreaterThanOne() {
        // Covers line 93: p > 1 branch
        Map<String, Object> params = new HashMap<>();
        params.put("stolenProbability", 1.5); // > 1, invalid

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("stolenProbability"));
    }

    @Test
    void updateSimValidatesItvFailProbabilityNegative() {
        // Covers line 103: p < 0 branch
        Map<String, Object> params = new HashMap<>();
        params.put("itvFailProbability", -0.3); // < 0, invalid

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("itvFailProbability"));
    }

    @Test
    void updateSimValidatesOcrDelayMsNull() {
        // Covers line 113: ms == null branch
        Map<String, Object> params = new HashMap<>();
        params.put("ocrDelayMs", new Object()); // not a Number or String -> toInt returns null

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("ocrDelayMs"));
    }

    @Test
    void updateSimValidatesVehiclesPerCycleNull() {
        // Covers lines 123-124: n == null branch
        Map<String, Object> params = new HashMap<>();
        params.put("vehiclesPerCycle", new Object()); // not a Number or String -> toInt returns null

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("vehiclesPerCycle"));
    }

    @Test
    void updateSimValidatesVehiclesPerCycleZero() {
        // Covers lines 123-124: n <= 0 branch
        Map<String, Object> params = new HashMap<>();
        params.put("vehiclesPerCycle", 0);

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("vehiclesPerCycle"));
    }

    @Test
    void updateSimValidatesVehiclesPerCycleNegative() {
        // Covers lines 123-124: n <= 0 branch (negative)
        Map<String, Object> params = new HashMap<>();
        params.put("vehiclesPerCycle", -5);

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("vehiclesPerCycle"));
    }

    @Test
    void updateSimValidatesVehicleIntervalMsNull() {
        // Covers line 133: ms == null branch
        Map<String, Object> params = new HashMap<>();
        params.put("vehicleIntervalMs", new Object()); // not a Number or String -> toInt returns null

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("vehicleIntervalMs"));
    }

    @Test
    void updateSimValidatesVehicleIntervalMsNegative() {
        // Covers line 133: ms < 0 branch
        Map<String, Object> params = new HashMap<>();
        params.put("vehicleIntervalMs", -100);

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("vehicleIntervalMs"));
    }

    @Test
    void updateSimValidatesStolenProbabilityNull() {
        // Covers line 93: p == null branch
        Map<String, Object> params = new HashMap<>();
        params.put("stolenProbability", new Object()); // toDouble returns null

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("stolenProbability"));
    }

    @Test
    void updateSimValidatesItvFailProbabilityNull() {
        // Covers line 103: p == null branch
        Map<String, Object> params = new HashMap<>();
        params.put("itvFailProbability", new Object()); // toDouble returns null

        Map<String, Object> result = controller.updateSim(params);

        assertEquals("PARTIAL", result.get("status"));
        Map<?, ?> errors = (Map<?, ?>) result.get("errors");
        assertTrue(errors.containsKey("itvFailProbability"));
    }
}
