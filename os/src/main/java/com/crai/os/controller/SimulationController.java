package com.crai.os.controller;

import com.crai.os.service.SimulationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @RequestMapping(value = "/start", method = { RequestMethod.POST, RequestMethod.GET })
    public String start() {
        simulationService.startSimulation();
        return "Simulation started!";
    }

    @RequestMapping(value = "/stop", method = { RequestMethod.POST, RequestMethod.GET })
    public String stop() {
        simulationService.stopSimulation();
        return "Simulation stopped.";
    }

    @GetMapping("/status")
    public String status() {
        return simulationService.getStatus();
    }
}

