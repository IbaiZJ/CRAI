package com.crai.os.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.crai.os.config.SimulationConfig;
import com.crai.os.model.Vehicle;

@ExtendWith(MockitoExtension.class)
class VehicleSpawnerServiceTest {

    @Mock
    private CameraPoolService cameraPoolService;

    @Mock
    private SimulationService simulationService;

    private SimulationConfig config;
    private VehicleSpawnerService spawner;

    @BeforeEach
    void setUp() {
        config = new SimulationConfig();
        spawner = new VehicleSpawnerService(cameraPoolService, config, simulationService);
    }

    @Test
    void spawnVehicleDoesNothingWhenSimulationStopped() {
        when(simulationService.isRunning()).thenReturn(false);

        spawner.spawnVehicle();

        verify(cameraPoolService, never()).enqueueVehicle(any());
    }

    @Test
    void spawnVehicleEnqueuesConfiguredNumberWithGeneratedVehicles() {
        when(simulationService.isRunning()).thenReturn(true);
        config.setVehiclesPerCycle(2);
        config.setStolenProbability(0.5);
        config.setItvFailProbability(0.1);

        ArgumentCaptor<Vehicle> vehicleCaptor = ArgumentCaptor.forClass(Vehicle.class);

        spawner.spawnVehicle();

        verify(cameraPoolService, times(2)).enqueueVehicle(vehicleCaptor.capture());

        assertEquals(2, vehicleCaptor.getAllValues().size());
        for (Vehicle v : vehicleCaptor.getAllValues()) {
            assertTrue(v.getPlate() != null && !v.getPlate().isEmpty());
        }
    }
}
