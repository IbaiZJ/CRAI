package com.crai;

import com.sun.net.httpserver.*;
import org.json.JSONObject;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class SimulationServer {

    public static void start(int port, SimulationEngine engine) throws IOException {

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/simulate", exchange -> {
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            JSONObject input = body.isEmpty() ? new JSONObject() : new JSONObject(body);

            String resultJson = engine.runSimulation(input);

            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, resultJson.length());
            OutputStream os = exchange.getResponseBody();
            os.write(resultJson.getBytes());
            os.close();
        });

        server.start();
        System.out.println("🌐 Java Simulation Server running at http://localhost:" + port + "/simulate");
    }
}
