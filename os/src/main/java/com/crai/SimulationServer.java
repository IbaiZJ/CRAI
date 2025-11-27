package com.crai;

import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;

public class SimulationServer {

    public static void start(int port, SimulationEngine engine) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/simulate", exchange -> {
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            String json = engine.runSimulation();
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, json.length());

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(json.getBytes());
            }
        });

        server.start();
        System.out.println("🌐 Simulation HTTP server running at http://localhost:" + port + "/simulate");
    }
}
