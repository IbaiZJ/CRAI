package com.crai;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class PoliceAlertClient {

    private static final String NODE_RED_URL = "http://localhost:1880/stolen-alert";

    public static void sendStolenAlert(String plate) {
        try {
            URL url = new URL(NODE_RED_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            JSONObject json = new JSONObject();
            json.put("plate", plate);
            json.put("timestamp", System.currentTimeMillis());

            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.toString().getBytes(StandardCharsets.UTF_8));
            }

            conn.getResponseCode(); // fuerza la ejecución
            conn.disconnect();

            System.out.println("📡 Alert sent to Node-RED → " + plate);

        } catch (Exception e) {
            System.err.println("❌ Error sending alert to Node-RED: " + e.getMessage());
        }
    }
}
