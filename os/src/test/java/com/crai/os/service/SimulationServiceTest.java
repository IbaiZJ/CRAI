package com.crai.os.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.crai.os.model.SimulationState;

class SimulationServiceTest {

    private SimulationState state;
    private SimulationService service;

    @BeforeEach
    void setUp() {
        state = new SimulationState();
        service = new SimulationService(state);
    }

    @Test
    void startSimulationSetsRunningTrue() {
        service.startSimulation();
        assertTrue(state.isRunning());
        assertEquals("Running", service.getStatus());
        assertTrue(service.isRunning());
    }

    @Test
    void stopSimulationSetsRunningFalse() {
        state.setRunning(true); // ensure it was true before stopping

        service.stopSimulation();
        assertFalse(state.isRunning());
        assertEquals("Stopped", service.getStatus());
        assertFalse(service.isRunning());
    }
}
