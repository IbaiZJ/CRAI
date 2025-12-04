package com.crai.os.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SimulationConfig {

    private volatile int cameraCount = 3;
    private volatile int vehiclesPerCycle = 1;
    private volatile int vehicleIntervalMs = 2000;

    private volatile int ocrDelayMs = 200;
    private volatile int cameraQueueCapacity = 100;
    private volatile int policeQueueCapacity = 200;

    private volatile double stolenProbability = 0.05;
    private volatile double itvFailProbability = 0.30;

    @Value("${node-red.webhook-url:http://localhost:1880/alerts}")
    private String nodeRedWebhookUrl;

    public int getCameraCount() {
        return cameraCount;
    }

    public int getVehiclesPerCycle() {
        return vehiclesPerCycle;
    }

    public int getVehicleIntervalMs() {
        return vehicleIntervalMs;
    }

    public int getOcrDelayMs() {
        return ocrDelayMs;
    }

    public int getCameraQueueCapacity() {
        return cameraQueueCapacity;
    }

    public int getPoliceQueueCapacity() {
        return policeQueueCapacity;
    }

    public double getStolenProbability() {
        return stolenProbability;
    }

    public double getItvFailProbability() {
        return itvFailProbability;
    }

    public String getNodeRedWebhookUrl() {
        return nodeRedWebhookUrl;
    }

    // SETTERS para cambiar en tiempo real
    public void setCameraCount(int count) {
        this.cameraCount = count;
    }

    public void setVehiclesPerCycle(int n) {
        this.vehiclesPerCycle = n;
    }

    public void setVehicleIntervalMs(int ms) {
        this.vehicleIntervalMs = ms;
    }

    public void setOcrDelayMs(int ms) {
        this.ocrDelayMs = ms;
    }

    public void setStolenProbability(double p) {
        this.stolenProbability = p;
    }

    public void setItvFailProbability(double p) {
        this.itvFailProbability = p;
    }
}
