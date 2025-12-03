package com.crai.os.service;

import com.crai.os.model.SimulationState;
import org.springframework.stereotype.Service;

@Service
public class SimulationService {

    private final SimulationState state;

    public SimulationService(SimulationState state) {
        this.state = state;
    }

    public void startSimulation() {
        state.setRunning(true);
    }

    public void stopSimulation() {
        state.setRunning(false);
    }

    public String getStatus() {
        return state.isRunning() ? "Running" : "Stopped";
    }

    public boolean isRunning() {
        return state.isRunning();
    }
}
