package com.crai.os.service;

import com.crai.os.model.Vehicle;
import com.crai.os.config.SimulationConfig;
import com.crai.os.utils.RandomVehicleGenerator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class VehicleSpawnerService {

    private final CameraPoolService cameraPoolService;
    private final SimulationConfig config;
    private final SimulationService simulationService;

    public VehicleSpawnerService(CameraPoolService cameraPoolService,
            SimulationConfig config,
            SimulationService simulationService) {
        this.cameraPoolService = cameraPoolService;
        this.config = config;
        this.simulationService = simulationService;
    }

    /**
     * Genera vehiculos segun los parametros dinamicos configurables.
     */
    @Scheduled(fixedDelayString = "#{simulationConfig.vehicleIntervalMs}")
    public void spawnVehicle() {

        if (!simulationService.isRunning()) {
            return;
        }

        int count = config.getVehiclesPerCycle();

        for (int i = 0; i < count; i++) {
            Vehicle v = RandomVehicleGenerator.generate(
                    config.getStolenProbability(),
                    config.getItvFailProbability());

            System.out.println("Generando vehiculo aleatorio: " + v);

            cameraPoolService.enqueueVehicle(v);
        }
    }
}

