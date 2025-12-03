package com.crai.os.model;

import org.springframework.stereotype.Component;

@Component
public class SimulationState {

    // Start stopped; external trigger (e.g., Node-RED inject calling /simulation/start) will enable generation
    private boolean running = false;

    public synchronized void setRunning(boolean running) {
        this.running = running;
    }

    public synchronized boolean isRunning() {
        return running;
    }
}
