package com.crai;

public class Main {
    public static void main(String[] args) throws Exception {
        SimulationEngine engine = new SimulationEngine();
        SimulationServer.start(8080, engine);
    }
}
