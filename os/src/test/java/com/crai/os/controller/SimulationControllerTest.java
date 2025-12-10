package com.crai.os.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.service.SimulationService;

@ExtendWith(MockitoExtension.class)
class SimulationControllerTest {

    @Mock
    private SimulationService simulationService;

    private SimulationController controller;

    @BeforeEach
    void setUp() {
        controller = new SimulationController(simulationService);
    }

    @Test
    void startTriggersSimulation() {
        String response = controller.start();

        assertEquals("Simulation started!", response);
        verify(simulationService).startSimulation();
    }

    @Test
    void stopTriggersSimulationStop() {
        String response = controller.stop();

        assertEquals("Simulation stopped.", response);
        verify(simulationService).stopSimulation();
    }

    @Test
    void statusReturnsServiceStatus() {
        when(simulationService.getStatus()).thenReturn("running");

        String response = controller.status();

        assertEquals("running", response);
        verify(simulationService).getStatus();
    }
}
